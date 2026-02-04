
import { Product, Show, Order, Seller } from '../types.ts';
import { globalProducts } from './mockData.ts';

const DB_URL = "https://vshpgjexuqmrtxvytmzv.supabase.co/rest/v1";
const ADMIN_WA = "923079490721";
const PRODUCTION_DOMAIN = "world-market-one.vercel.app";

class ApiService {
  private get headers() {
    return {
      'Content-Type': 'application/json',
      'apikey': process.env.API_KEY || "",
      'Authorization': `Bearer ${process.env.API_KEY || ""}`,
      'Prefer': 'return=representation'
    };
  }

  public getProductionUrl(slug: string): string {
    // Standardized clean link format
    return `https://${PRODUCTION_DOMAIN}/#/show/${slug}`;
  }

  // Implementation for getSellerById used in SellerDashboard
  async getSellerById(id: string): Promise<Seller | null> {
    try {
      const res = await fetch(`${DB_URL}/sellers?id=eq.${id}&select=*`, { headers: this.headers });
      const data = await res.json();
      if (data && data[0]) return data[0];
      
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
      return local.find((s: Seller) => s.id === id) || null;
    } catch {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
      return local.find((s: Seller) => s.id === id) || null;
    }
  }

  // Implementation for findSellerBySlug used in ShopFront and SellerStorefront
  async findSellerBySlug(slug: string): Promise<Seller | undefined> {
    try {
      const res = await fetch(`${DB_URL}/sellers?slug=eq.${slug}&select=*`, { headers: this.headers });
      const data = await res.json();
      if (data && data[0]) return data[0];
      
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
      return local.find((s: Seller) => s.slug === slug);
    } catch {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
      return local.find((s: Seller) => s.slug === slug);
    }
  }

  // Implementation for getProductsBySeller used in ShopFront
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    // Products are managed centrally by Admin for all sellers
    return this.getGlobalProducts();
  }

  // Implementation for initOrder used in ShopFront
  async initOrder(orderData: any): Promise<void> {
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `ORD-${Date.now()}`,
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt || new Date().toISOString()
    };
    
    try {
      await fetch(`${DB_URL}/orders`, { 
        method: 'POST', 
        headers: this.headers, 
        body: JSON.stringify(newOrder) 
      });
    } catch {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
      local.push(newOrder);
      localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
    }
  }

  // Implementation for finalizeOrder used in PaymentSuccess
  async finalizeOrder(orderId: string, status: string, tid: string): Promise<void> {
    try {
      await fetch(`${DB_URL}/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ status, transactionId: tid })
      });
    } catch {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
      const index = local.findIndex((o: Order) => o.id === orderId);
      if (index > -1) {
        local[index] = { ...local[index], status, transactionId: tid };
        localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
      }
    }
  }

  // Implementation for registerSeller used in VendorLanding
  async registerSeller(data: any): Promise<Seller> {
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      id: crypto.randomUUID(),
      name: data.name,
      fullName: data.name,
      slug,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      status: 'active',
      ...data
    };
    
    try {
      await fetch(`${DB_URL}/sellers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(newSeller)
      });
    } catch {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
      local.push(newSeller);
      localStorage.setItem('APS_LOCAL_SELLERS', JSON.stringify(local));
    }
    
    return newSeller;
  }

  // Implementation for uploadProduct used in AdminPanel
  async uploadProduct(product: Product): Promise<void> {
    try {
      await fetch(`${DB_URL}/products`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(product)
      });
    } catch {
      // In a real app, we would push to the globalProducts array in mockData
      // or update local storage
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_PRODUCTS') || '[]');
      local.push(product);
      localStorage.setItem('APS_LOCAL_PRODUCTS', JSON.stringify(local));
    }
  }

  async registerShow(data: any): Promise<Show> {
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newShow: Show = {
      id: crypto.randomUUID(),
      name: data.name,
      slug,
      sellerName: data.sellerName,
      whatsapp: data.whatsapp,
      createdAt: new Date().toISOString(),
      sellerData: {
        email: data.email,
        country: data.country,
        city: data.city,
        contactNumber: data.contactNumber,
        paymentMethod: data.country === 'Pakistan' ? 'JazzCash' : 'Bank Account',
        paymentDetails: data.paymentDetails
      }
    };
    
    try {
      const res = await fetch(`${DB_URL}/shows`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(newShow)
      });
      if (!res.ok) throw new Error("Cloud sync failed");
      
      // Notify Admin via WhatsApp instantly
      this.notifyAdminNewSeller(newShow);
      
      return newShow;
    } catch (e) {
      console.warn("Cloud error, using local fallback", e);
      const existing = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
      existing.push(newShow);
      localStorage.setItem('APS_LOCAL_SHOWS', JSON.stringify(existing));
      this.notifyAdminNewSeller(newShow);
      return newShow;
    }
  }

  private notifyAdminNewSeller(show: Show) {
    const msg = `*NEW SELLER REGISTERED – Admin Patch Shop*\n` +
      `--------------------------------\n` +
      `Name: ${show.sellerName}\n` +
      `WhatsApp: ${show.whatsapp}\n` +
      `Email: ${show.sellerData?.email}\n` +
      `Country: ${show.sellerData?.country}\n` +
      `City: ${show.sellerData?.city}\n` +
      `Contact Number: ${show.sellerData?.contactNumber}\n` +
      `Payment Method: ${show.sellerData?.paymentMethod}\n` +
      `Details: ${show.sellerData?.paymentDetails}\n` +
      `Show Link: ${this.getProductionUrl(show.slug)}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  async findShowBySlug(slug: string): Promise<Show | undefined> {
    try {
      const res = await fetch(`${DB_URL}/shows?slug=eq.${slug}&select=*`, { headers: this.headers });
      const data = await res.json();
      if (data && data[0]) return data[0];
      
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
      return local.find((s: Show) => s.slug === slug);
    } catch {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
      return local.find((s: Show) => s.slug === slug);
    }
  }

  async placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    try {
      await fetch(`${DB_URL}/orders`, { method: 'POST', headers: this.headers, body: JSON.stringify(newOrder) });
    } catch {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
      local.push(newOrder);
      localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
    }

    const message = `*New Order – Admin Patch Shop*\n` +
      `--------------------------------\n` +
      `Name: ${newOrder.customerName}\n` +
      `WhatsApp: ${newOrder.customerWhatsapp}\n` +
      `Email: ${newOrder.customerEmail}\n` +
      `Address: ${newOrder.customerAddress}\n` +
      `Location: ${newOrder.customerLocation}\n` +
      `Product: ${newOrder.productName}\n` +
      `Price: $${newOrder.productPrice}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
  }

  async getGlobalProducts(): Promise<Product[]> { return globalProducts; }
  async getAllProducts(): Promise<Product[]> { return globalProducts; }
  async getAllOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${DB_URL}/orders?select=*`, { headers: this.headers });
      return await res.json();
    } catch {
      return JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
    }
  }
}

export const api = new ApiService();
