
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
    // Standardized clean link format using HashRouter
    return `https://${PRODUCTION_DOMAIN}/#/show/${slug}`;
  }

  // Required by SellerDashboard
  async getSellerById(id: string): Promise<Seller | null> {
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    return local.find((s: Seller) => s.id === id) || null;
  }

  // Required by ShopFront and SellerStorefront
  async findSellerBySlug(slug: string): Promise<Seller | undefined> {
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    return local.find((s: Seller) => s.slug === slug);
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return this.getGlobalProducts();
  }

  async initOrder(orderData: any): Promise<void> {
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
    local.push(orderData);
    localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
  }

  async finalizeOrder(orderId: string, status: string, tid: string): Promise<void> {
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
    const index = local.findIndex((o: Order) => o.id === orderId);
    if (index > -1) {
      local[index] = { ...local[index], status, transactionId: tid };
      localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
    }
  }

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
    
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    local.push(newSeller);
    localStorage.setItem('APS_LOCAL_SELLERS', JSON.stringify(local));
    
    return newSeller;
  }

  async uploadProduct(product: Product): Promise<void> {
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_PRODUCTS') || '[]');
    local.push(product);
    localStorage.setItem('APS_LOCAL_PRODUCTS', JSON.stringify(local));
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
      // Prioritize Cloud Registration for global accessibility
      await fetch(`${DB_URL}/shows`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(newShow)
      });
    } catch (e) {
      console.warn("Cloud sync failed, falling back to local memory.");
    }

    // Always keep a local copy and notify admin
    const existing = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
    existing.push(newShow);
    localStorage.setItem('APS_LOCAL_SHOWS', JSON.stringify(existing));
    
    this.notifyAdminNewSeller(newShow);
    return newShow;
  }

  private notifyAdminNewSeller(show: Show) {
    const msg = `*NEW SHOW CREATED*\n` +
      `--------------------------------\n` +
      `Shop Name: ${show.name}\n` +
      `Owner: ${show.sellerName}\n` +
      `WhatsApp: ${show.whatsapp}\n` +
      `Global Link: ${this.getProductionUrl(show.slug)}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  async findShowBySlug(slug: string): Promise<Show | undefined> {
    try {
      // Check Cloud Database first so links work on all devices
      const res = await fetch(`${DB_URL}/shows?slug=eq.${slug}&select=*`, { headers: this.headers });
      const data = await res.json();
      if (data && data[0]) return data[0];
    } catch (e) {
      console.warn("Database unavailable, checking local node.");
    }
    
    // Check local fallback
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
    return local.find((s: Show) => s.slug === slug);
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
    } catch (e) {
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
      local.push(newOrder);
      localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
    }

    const message = `*NEW CUSTOMER ORDER*\n` +
      `--------------------------------\n` +
      `Product: ${newOrder.productName}\n` +
      `Price: $${newOrder.productPrice}\n` +
      `Name: ${newOrder.customerName}\n` +
      `WA: ${newOrder.customerWhatsapp}\n` +
      `Addr: ${newOrder.customerAddress}`;

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
