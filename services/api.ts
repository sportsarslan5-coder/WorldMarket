
import { Product, Show, Order, Seller } from '../types.ts';
import { globalProducts } from './mockData.ts';

const ADMIN_WA = "923079490721";

class ApiService {
  private getStore<T>(key: string): T[] {
    const data = localStorage.getItem(`APS_V2_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private setStore(key: string, data: any) {
    localStorage.setItem(`APS_V2_${key}`, JSON.stringify(data));
  }

  // --- SHOW OPERATIONS ---
  async registerShow(data: { name: string, sellerName: string, whatsapp: string }): Promise<Show> {
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newShow: Show = {
      ...data,
      id: crypto.randomUUID(),
      slug,
      createdAt: new Date().toISOString()
    };
    
    const shows = this.getStore<Show>('shows');
    shows.push(newShow);
    this.setStore('shows', shows);
    return newShow;
  }

  async findShowBySlug(slug: string): Promise<Show | undefined> {
    return this.getStore<Show>('shows').find(s => s.slug === slug);
  }

  // --- SELLER OPERATIONS (AMZ PRIME Compatible) ---
  async registerSeller(data: Omit<Seller, 'id' | 'slug' | 'status'>): Promise<Seller> {
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      ...data,
      id: `SEL-${Date.now()}`,
      slug,
      status: 'active'
    };
    const sellers = this.getStore<Seller>('sellers');
    sellers.push(newSeller);
    this.setStore('sellers', sellers);
    return newSeller;
  }

  async findSellerBySlug(slug: string): Promise<Seller | undefined> {
    return this.getStore<Seller>('sellers').find(s => s.slug === slug);
  }

  async getSellerById(id: string): Promise<Seller | null> {
    return this.getStore<Seller>('sellers').find(s => s.id === id) || null;
  }

  // --- PRODUCT OPERATIONS (Admin Only) ---
  async getGlobalProducts(): Promise<Product[]> {
    const custom = this.getStore<Product>('custom_products');
    return [...globalProducts, ...custom];
  }

  async getAllProducts(): Promise<Product[]> {
    return this.getGlobalProducts();
  }

  async addAdminProduct(p: Omit<Product, 'id'>): Promise<void> {
    const products = this.getStore<Product>('custom_products');
    products.push({ ...p, id: `ADM-${Date.now()}` });
    this.setStore('custom_products', products);
  }

  async uploadProduct(p: Product): Promise<void> {
    const products = this.getStore<Product>('custom_products');
    products.push(p);
    this.setStore('custom_products', products);
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    // In this unified model, all products are available globally
    return this.getGlobalProducts();
  }

  // --- ORDER OPERATIONS ---
  async placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<void> {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const orders = this.getStore<Order>('orders');
    orders.push(newOrder);
    this.setStore('orders', orders);

    const message = `*NEW SHOW ORDER*\n` +
      `--------------------------\n` +
      `Show: /show/${newOrder.showSlug}\n` +
      `Product: ${newOrder.productName}\n` +
      `Price: $35 USD\n` +
      `--------------------------\n` +
      `Customer: ${newOrder.customerName}\n` +
      `WA: ${newOrder.customerWhatsapp}\n` +
      `Address: ${newOrder.customerAddress || newOrder.customerLocation}`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(message)}`, '_blank');
  }

  async initOrder(order: Order): Promise<void> {
    const orders = this.getStore<Order>('orders');
    orders.push(order);
    this.setStore('orders', orders);
  }

  async finalizeOrder(orderId: string, status: 'completed', tid: string): Promise<void> {
    const orders = this.getStore<Order>('orders');
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index].status = status;
      orders[index].transactionId = tid;
      this.setStore('orders', orders);
    }
  }

  async getAllOrders(): Promise<Order[]> {
    return this.getStore<Order>('orders');
  }
}

export const api = new ApiService();
