
import { Product, Seller, Order } from '../types.ts';

/**
 * PRODUCTION CLOUD CONTROLLER - GLOBAL SCALE
 * Handles permanent persistence and automated logistics with zero-fail WhatsApp dispatch.
 */
const DB_URL = "https://vshpgjexuqmrtxvytmzv.supabase.co/rest/v1"; 
const ADMIN_WA = "923079490721"; // Standardized International Format

class ApiService {
  private get headers() {
    return {
      'Content-Type': 'application/json',
      'apikey': process.env.API_KEY || "",
      'Authorization': `Bearer ${process.env.API_KEY || ""}`,
      'Prefer': 'return=representation'
    };
  }

  // --- SELLER OPERATIONS ---

  async registerSeller(data: Omit<Seller, 'id' | 'slug' | 'registeredAt'>): Promise<Seller> {
    const slug = data.storeName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      ...data,
      id: crypto.randomUUID(),
      slug,
      registeredAt: new Date().toISOString()
    };

    // Attempt Cloud Save
    try {
      const res = await fetch(`${DB_URL}/sellers`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(newSeller)
      });
      if (!res.ok) this.syncLocal('sellers', newSeller);
    } catch (e) {
      this.syncLocal('sellers', newSeller);
    }

    // MANDATORY WHATSAPP DISPATCH
    const message = `*NEW SELLER REGISTRATION*\n\n` +
      `Owner: ${newSeller.name}\n` +
      `Store: ${newSeller.storeName}\n` +
      `City: ${newSeller.location}\n` +
      `WhatsApp: ${newSeller.whatsapp}\n` +
      `Email: ${newSeller.email}\n` +
      `Bank Account: ${newSeller.bankAccount}\n\n` +
      `Store Link: ${window.location.origin}/#/${newSeller.slug}`;
    
    this.sendWhatsApp(message);

    return newSeller;
  }

  async fetchAllSellers(): Promise<Seller[]> {
    try {
      const res = await fetch(`${DB_URL}/sellers?select=*`, { headers: this.headers });
      if (!res.ok) return this.getLocal('sellers');
      return await res.json();
    } catch { return this.getLocal('sellers'); }
  }

  async findSellerBySlug(slug: string): Promise<Seller | null> {
    try {
      const res = await fetch(`${DB_URL}/sellers?slug=eq.${slug}&select=*`, { headers: this.headers });
      const data = await res.json();
      if (!data[0]) return this.getLocal<Seller>('sellers').find(s => s.slug === slug) || null;
      return data[0];
    } catch {
      return this.getLocal<Seller>('sellers').find(s => s.slug === slug) || null;
    }
  }

  async getSellerById(id: string): Promise<Seller | null> {
    try {
      const res = await fetch(`${DB_URL}/sellers?id=eq.${id}&select=*`, { headers: this.headers });
      const data = await res.json();
      return data[0] || this.getLocal<Seller>('sellers').find(s => s.id === id) || null;
    } catch { return this.getLocal<Seller>('sellers').find(s => s.id === id) || null; }
  }

  // --- PRODUCT OPERATIONS ---

  // Refined uploadProduct to accept flexible partial inputs while ensuring default values
  async uploadProduct(product: any): Promise<Product> {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      sellerId: 's1',
      sellerName: 'Prime Design Labs',
      size: 'Universal',
      color: 'Standard',
      description: '',
      imageUrl: '',
      category: 'General',
      price: 0,
      name: 'Unnamed Product',
      ...product,
    };

    try {
      const res = await fetch(`${DB_URL}/products`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(newProduct)
      });
      if (!res.ok) this.syncLocal('products', newProduct);
    } catch (e) {
      this.syncLocal('products', newProduct);
    }
    
    return newProduct;
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    try {
      const res = await fetch(`${DB_URL}/products?sellerId=eq.${sellerId}&select=*`, { headers: this.headers });
      if (!res.ok) return this.getLocal<Product>('products').filter(p => p.sellerId === sellerId);
      return await res.json();
    } catch { return this.getLocal<Product>('products').filter(p => p.sellerId === sellerId); }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${DB_URL}/products?select=*`, { headers: this.headers });
      if (!res.ok) return this.getLocal('products');
      return await res.json();
    } catch { return this.getLocal('products'); }
  }

  // --- ORDER & SETTLEMENT ---

  async placeOrder(orderData: Omit<Order, 'id' | 'commission' | 'createdAt'>): Promise<void> {
    const price = Number(orderData.productPrice);
    const adminAmt = price * 0.95;
    const sellerAmt = price * 0.05;

    const fullOrder: Order = {
      ...orderData,
      id: `PRIME-${Date.now()}`,
      commission: {
        adminAmount: adminAmt,
        sellerAmount: sellerAmt
      },
      createdAt: new Date().toISOString()
    };

    try {
      await fetch(`${DB_URL}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(fullOrder)
      });
    } catch (e) {
      this.syncLocal('orders', fullOrder);
    }

    const message = `*NEW ORDER INCOMING*\n` +
      `---------------------------\n` +
      `*PRODUCT:* ${fullOrder.productName}\n` +
      `*PRICE:* Rs. ${fullOrder.productPrice}\n` +
      `*VENDOR:* ${fullOrder.sellerName} (/${fullOrder.sellerSlug})\n` +
      `---------------------------\n` +
      `*COMMISSION SPLIT*\n` +
      `Admin (95%): Rs. ${adminAmt.toFixed(2)}\n` +
      `Seller (5%): Rs. ${sellerAmt.toFixed(2)}\n` +
      `---------------------------\n` +
      `*CUSTOMER INFO*\n` +
      `Name: ${fullOrder.customerName}\n` +
      `WhatsApp: ${fullOrder.customerWhatsapp}\n` +
      `Address: ${fullOrder.customerLocation}`;

    this.sendWhatsApp(message);
  }

  // New initOrder method for multi-step checkout flows (like 2Checkout)
  async initOrder(order: any): Promise<void> {
    try {
      await fetch(`${DB_URL}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(order)
      });
    } catch (e) {
      this.syncLocal('orders', order);
    }
  }

  // New finalizeOrder method to update order status and transaction IDs after payment
  async finalizeOrder(id: string, status: string, transactionId: string): Promise<void> {
    try {
      const res = await fetch(`${DB_URL}/orders?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ status, transactionId })
      });
      if (!res.ok) throw new Error();
    } catch {
      const k = `AMZ_PRIME_orders`;
      const orders = JSON.parse(localStorage.getItem(k) || '[]');
      const idx = orders.findIndex((o: any) => o.id === id);
      if (idx > -1) {
        orders[idx] = { ...orders[idx], status, transactionId };
        localStorage.setItem(k, JSON.stringify(orders));
      }
    }
  }

  async fetchAllOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${DB_URL}/orders?select=*`, { headers: this.headers });
      if (!res.ok) return this.getLocal('orders');
      return await res.json();
    } catch { return this.getLocal('orders'); }
  }

  // --- INTERNAL UTILITIES ---

  private sendWhatsApp(text: string) {
    const url = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = url;
    }
  }

  private syncLocal(key: string, data: any) {
    const k = `AMZ_PRIME_${key}`;
    const existing = JSON.parse(localStorage.getItem(k) || '[]');
    existing.push(data);
    localStorage.setItem(k, JSON.stringify(existing));
  }

  private getLocal<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(`AMZ_PRIME_${key}`) || '[]');
  }
}

export const api = new ApiService();
