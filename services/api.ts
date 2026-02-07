
import { Product, Show, Order, Seller } from '../types.ts';
import { globalProducts } from './mockData.ts';

// Global Cloud Hub - Supabase REST Layer
const DB_URL = "https://vshpgjexuqmrtxvytmzv.supabase.co/rest/v1";
const ADMIN_WA = "923079490721";
const PRODUCTION_DOMAIN = "world-market-one.vercel.app";

class ApiService {
  private get headers() {
    // Ensuring the API key from the environment is used for global auth
    const apiKey = process.env.API_KEY || "";
    return {
      'Content-Type': 'application/json',
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Prefer': 'return=representation'
    };
  }

  public getProductionUrl(slug: string): string {
    // Hash routing ensures the link works even if mobile browsers strip path metadata
    return `https://${PRODUCTION_DOMAIN}/#/${slug.toLowerCase().trim()}`;
  }

  async findSellerBySlug(slug: string): Promise<Seller | undefined> {
    const lowerSlug = slug.toLowerCase().trim();
    // Prioritize Cloud Check for Sellers
    try {
      const res = await fetch(`${DB_URL}/sellers?slug=eq.${lowerSlug}&select=*`, { headers: this.headers });
      const data = await res.json();
      if (data && data.length > 0) return data[0];
    } catch (e) {
      console.warn("Seller Cloud Node check failed, checking local cache.");
    }
    
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    return local.find((seller: Seller) => seller.slug.toLowerCase() === lowerSlug);
  }

  // Fix: Added missing registerSeller method
  async registerSeller(data: any): Promise<Seller> {
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const seller: Seller = {
      id: crypto.randomUUID(),
      name: data.name,
      storeName: data.storeName || data.name,
      slug: slug,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      status: 'active',
      phoneNumber: data.phone,
      payoutInfo: { method: data.bankAccount || 'N/A' }
    };

    try {
      await fetch(`${DB_URL}/sellers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(seller)
      });
    } catch (e) {
      console.warn("Seller cloud registration failed.");
    }

    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    local.push(seller);
    localStorage.setItem('APS_LOCAL_SELLERS', JSON.stringify(local));
    return seller;
  }

  async registerShow(data: any): Promise<Show> {
    // Sanitize slug for universal link compatibility
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
    
    // CRITICAL: Force Sync to Cloud Database
    const response = await fetch(`${DB_URL}/shows`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(newShow)
    });

    if (!response.ok) {
      throw new Error("GLOBAL_SYNC_REFUSED: Could not push shop to Cloud Registry.");
    }

    // Secondary backup in local storage
    const existing = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
    existing.push(newShow);
    localStorage.setItem('APS_LOCAL_SHOWS', JSON.stringify(existing));
    
    this.notifyAdminNewSeller(newShow);
    return newShow;
  }

  async findShowBySlug(slug: string): Promise<Show | undefined> {
    if (!slug) return undefined;
    const cleanSlug = slug.toLowerCase().trim();

    try {
      // PRIMARY FETCH: Search Global Registry first so other devices can find the shop
      const res = await fetch(`${DB_URL}/shows?slug=eq.${cleanSlug}&select=*`, { 
        headers: this.headers,
        cache: 'no-store' 
      });
      const data = await res.json();
      if (data && data.length > 0) return data[0];
    } catch (e) {
      console.warn("Cloud connection jitter, attempting local fallback...");
    }
    
    // SECONDARY FETCH: Local storage (Creator's device only)
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SHOWS') || '[]');
    return local.find((s: Show) => s.slug.toLowerCase() === cleanSlug);
  }

  private notifyAdminNewSeller(show: Show) {
    const msg = `*GLOBAL SHOP ACTIVATED*\n` +
      `--------------------------------\n` +
      `Name: ${show.name}\n` +
      `Seller: ${show.sellerName}\n` +
      `WhatsApp: ${show.whatsapp}\n` +
      `Link: ${this.getProductionUrl(show.slug)}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // Fix: Added missing initOrder method
  async initOrder(order: Order): Promise<void> {
    try {
      await fetch(`${DB_URL}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(order)
      });
    } catch (e) {
      console.warn("Order initialization failed in cloud.");
    }
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
    local.push(order);
    localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
  }

  // Fix: Added missing finalizeOrder method
  async finalizeOrder(orderId: string, status: 'pending' | 'completed', transactionId: string): Promise<void> {
    try {
      await fetch(`${DB_URL}/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ status, transactionId })
      });
    } catch (e) {
      console.warn("Order finalization failed in cloud.");
    }

    const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
    const index = local.findIndex((o: Order) => o.id === orderId);
    if (index > -1) {
      local[index].status = status;
      local[index].transactionId = transactionId;
      localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
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
      await fetch(`${DB_URL}/orders`, { 
        method: 'POST', 
        headers: this.headers, 
        body: JSON.stringify(newOrder) 
      });
    } catch (e) {
      console.error("Order cloud sync failed, saving locally.");
      const local = JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
      local.push(newOrder);
      localStorage.setItem('APS_LOCAL_ORDERS', JSON.stringify(local));
    }

    const message = `*NEW ORDER RECEIVED*\n` +
      `--------------------------------\n` +
      `Shop: ${newOrder.showSlug}\n` +
      `Item: ${newOrder.productName}\n` +
      `Customer: ${newOrder.customerName}\n` +
      `WA: ${newOrder.customerWhatsapp}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
  }

  // Common UI helper methods
  async getGlobalProducts(): Promise<Product[]> { return globalProducts; }
  async getAllProducts(): Promise<Product[]> { return globalProducts; }
  async getProductsBySeller(sellerId: string): Promise<Product[]> { return globalProducts; }
  
  // Fix: Added missing uploadProduct method
  async uploadProduct(product: Product): Promise<void> {
    try {
      await fetch(`${DB_URL}/products`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(product)
      });
    } catch (e) {
      console.warn("Product cloud upload failed, saving locally.");
    }
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_PRODUCTS') || '[]');
    local.push(product);
    localStorage.setItem('APS_LOCAL_PRODUCTS', JSON.stringify(local));
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${DB_URL}/orders?select=*`, { headers: this.headers });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return JSON.parse(localStorage.getItem('APS_LOCAL_ORDERS') || '[]');
    }
  }

  async getSellerById(id: string): Promise<Seller | null> {
    const local = JSON.parse(localStorage.getItem('APS_LOCAL_SELLERS') || '[]');
    return local.find((s: Seller) => s.id === id) || null;
  }
}

export const api = new ApiService();
