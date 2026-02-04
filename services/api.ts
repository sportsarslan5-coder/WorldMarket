
import { Product, Show, Order, Seller } from '../types.ts';
import { globalProducts } from './mockData.ts';

/**
 * GLOBAL PRODUCTION CONTROLLER
 * Ensures links are permanent, publicly accessible, and device-independent.
 */
const DB_URL = "https://vshpgjexuqmrtxvytmzv.supabase.co/rest/v1";
const ADMIN_WA = "923079490721";

// SET YOUR PRODUCTION DOMAIN HERE FOR ENV PICKER SYNC
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

  // --- ENVIRONMENT PICKER LOGIC ---
  public getBaseUrl(): string {
    const current = window.location.hostname;
    // If in preview/local, still return production for shared links if possible
    if (current.includes('localhost') || current.includes('aistudio')) {
      return `https://${PRODUCTION_DOMAIN}`;
    }
    return `${window.location.origin}`;
  }

  // --- PERSISTENCE LAYER (CLOUD-FIRST) ---
  async registerShow(data: { name: string, sellerName: string, whatsapp: string }): Promise<Show> {
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newShow: Show = {
      ...data,
      id: crypto.randomUUID(),
      slug,
      createdAt: new Date().toISOString()
    };
    
    try {
      const res = await fetch(`${DB_URL}/shows`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(newShow)
      });
      if (!res.ok) throw new Error();
      const cloudData = await res.json();
      return cloudData[0] || newShow;
    } catch {
      this.saveLocal('shows', newShow);
      return newShow;
    }
  }

  async findShowBySlug(slug: string): Promise<Show | undefined> {
    try {
      const res = await fetch(`${DB_URL}/shows?slug=eq.${slug}&select=*`, { headers: this.headers });
      const data = await res.json();
      return data[0] || this.getLocal<Show>('shows').find(s => s.slug === slug);
    } catch {
      return this.getLocal<Show>('shows').find(s => s.slug === slug);
    }
  }

  // --- SELLER OPERATIONS ---
  async registerSeller(data: any): Promise<Seller> {
    const slug = data.storeName?.toLowerCase().trim().replace(/\s+/g, '-') || `seller-${Date.now()}`;
    const newSeller: Seller = {
      ...data,
      id: `SEL-${Date.now()}`,
      slug,
      status: 'active'
    };
    
    try {
      await fetch(`${DB_URL}/sellers`, { method: 'POST', headers: this.headers, body: JSON.stringify(newSeller) });
    } catch {
      this.saveLocal('sellers', newSeller);
    }
    return newSeller;
  }

  // --- ORDER FLOW ---
  // Fix: Added initOrder to handle initial order creation in checkout flow
  async initOrder(order: any): Promise<void> {
    try {
      await fetch(`${DB_URL}/orders`, { 
        method: 'POST', 
        headers: this.headers, 
        body: JSON.stringify(order) 
      });
    } catch {
      this.saveLocal('orders', order);
    }
  }

  // Fix: Added finalizeOrder to update order status and transaction ID after payment
  async finalizeOrder(orderId: string, status: string, transactionId: string): Promise<void> {
    try {
      await fetch(`${DB_URL}/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ status, transactionId })
      });
    } catch {
      const orders = this.getLocal<Order>('orders');
      const index = orders.findIndex(o => o.id === orderId);
      if (index > -1) {
        orders[index] = { ...orders[index], status: status as any, transactionId };
        localStorage.setItem(`APS_SYNC_orders`, JSON.stringify(orders));
      }
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
      this.saveLocal('orders', newOrder);
    }

    const message = `*NEW SHOW ORDER*\n` +
      `--------------------------\n` +
      `Show: /#/${newOrder.showSlug}\n` +
      `Product: ${newOrder.productName}\n` +
      `Customer: ${newOrder.customerName}\n` +
      `WA: ${newOrder.customerWhatsapp}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
  }

  // --- PRODUCT OPERATIONS ---
  // Fix: Added uploadProduct to allow admin to add new products to the global feed
  async uploadProduct(product: Product): Promise<void> {
    try {
      await fetch(`${DB_URL}/products`, { 
        method: 'POST', 
        headers: this.headers, 
        body: JSON.stringify(product) 
      });
    } catch {
      this.saveLocal('products', product);
    }
  }

  // --- HELPERS ---
  private saveLocal(key: string, data: any) {
    const existing = this.getLocal(key);
    existing.push(data);
    localStorage.setItem(`APS_SYNC_${key}`, JSON.stringify(existing));
  }

  private getLocal<T>(key: string): T[] {
    const data = localStorage.getItem(`APS_SYNC_${key}`);
    return data ? JSON.parse(data) : [];
  }

  // Required by components
  async getGlobalProducts(): Promise<Product[]> { return globalProducts; }
  
  // Fix: Updated getAllProducts to include locally saved products
  async getAllProducts(): Promise<Product[]> { 
    const local = this.getLocal<Product>('products');
    return [...globalProducts, ...local];
  }
  
  async getAllOrders(): Promise<Order[]> { return this.getLocal('orders'); }
  
  // Fix: Implemented getSellerById to search in local storage
  async getSellerById(id: string): Promise<Seller | null> { 
    return this.getLocal<Seller>('sellers').find(s => s.id === id) || null;
  }
  
  // Fix: Implemented findSellerBySlug to search in local storage
  async findSellerBySlug(slug: string): Promise<Seller | undefined> { 
    return this.getLocal<Seller>('sellers').find(s => s.slug === slug);
  }
  
  async getProductsBySeller(id: string): Promise<Product[]> { return this.getAllProducts(); }
}

export const api = new ApiService();
