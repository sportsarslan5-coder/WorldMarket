
import { Product, Show, Order, Seller } from '../types.ts';
import { globalProducts } from './mockData.ts';

const DB_URL = "https://vshpgjexuqmrtxvytmzv.supabase.co/rest/v1";
const ADMIN_WA = "923079490721";
const PRODUCTION_DOMAIN = "world-market-one.vercel.app";

class ApiService {
  private get headers() {
    const apiKey = process.env.API_KEY || "";
    return {
      'Content-Type': 'application/json',
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Prefer': 'return=representation'
    };
  }

  public getProductionUrl(slug: string): string {
    // Hash-based routing is essential for Vercel/SPA deep links to work on mobile
    return `https://${PRODUCTION_DOMAIN}/#/${slug.toLowerCase()}`;
  }

  async getSellerById(id: string): Promise<Seller | null> {
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    return local.find((s: Seller) => s.id === id) || null;
  }

  async findSellerBySlug(slug: string): Promise<Seller | undefined> {
    const lowerSlug = slug.toLowerCase();
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    return local.find((seller: Seller) => seller.slug.toLowerCase() === lowerSlug);
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
    
    // Critical: Verify cloud sync before considering registration successful
    const response = await fetch(`${DB_URL}/shows`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(newShow)
    });

    if (!response.ok) {
      throw new Error("GLOBAL_SYNC_FAILED: Database rejected registration.");
    }

    const existing = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
    existing.push(newShow);
    localStorage.setItem('APS_LOCAL_SHOWS', JSON.stringify(existing));
    
    this.notifyAdminNewSeller(newShow);
    return newShow;
  }

  private notifyAdminNewSeller(show: Show) {
    const msg = `*GLOBAL SHOP ACTIVE*\n` +
      `--------------------------------\n` +
      `Shop: ${show.name}\n` +
      `Seller: ${show.sellerName}\n` +
      `WA: ${show.whatsapp}\n` +
      `Link: ${this.getProductionUrl(show.slug)}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  async findShowBySlug(slug: string): Promise<Show | undefined> {
    if (!slug) return undefined;
    const cleanSlug = slug.toLowerCase().trim();

    try {
      // PRIMARY: Always fetch from Global Cloud Registry so links work for everyone
      const res = await fetch(`${DB_URL}/shows?slug=eq.${cleanSlug}&select=*`, { 
        headers: this.headers,
        cache: 'no-store' 
      });
      const data = await res.json();
      if (data && data.length > 0) return data[0];
    } catch (e) {
      console.warn("Cloud registry unreachable, falling back to local cache.");
    }
    
    // SECONDARY: Local fallback only for the creator's preview
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
    return local.find((s: Show) => s.slug.toLowerCase() === cleanSlug);
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

    const message = `*NEW ORDER ALERT*\n` +
      `--------------------------------\n` +
      `Item: ${newOrder.productName}\n` +
      `Price: $${newOrder.productPrice}\n` +
      `Customer: ${newOrder.customerName}\n` +
      `WhatsApp: ${newOrder.customerWhatsapp}`;

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
