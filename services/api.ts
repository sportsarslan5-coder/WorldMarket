
import { Shop, Product, Order, ShopStatus, PayoutInfo } from '../types.ts';
import { mockProducts, mockOrders } from './mockData.ts';

/**
 * GLOBAL PERSISTENCE ENGINE (Simulation)
 * IMPORTANT: To enable TRUE cross-device sync (Global Visibility), 
 * replace the localStorage calls with `fetch('https://your-api.com/...')`
 */
class GlobalDatabaseService {
  private static STORAGE_KEY = 'PK_MART_GLOBAL_DATA_V2';

  private getRegistry() {
    const data = localStorage.getItem(GlobalDatabaseService.STORAGE_KEY);
    if (!data) {
      const initial = { shops: [], products: mockProducts, orders: mockOrders };
      this.sync(initial);
      return initial;
    }
    return JSON.parse(data);
  }

  private sync(data: any) {
    localStorage.setItem(GlobalDatabaseService.STORAGE_KEY, JSON.stringify(data));
    // In production, this would be: await fetch('/api/sync', { method: 'POST', body: JSON.stringify(data) });
  }

  // --- SHOP ACTIONS ---
  async createShop(data: { name: string, email: string, whatsapp: string, category: string, payoutInfo: PayoutInfo }): Promise<Shop> {
    const db = this.getRegistry();
    
    // Prevent duplicates and errors
    const id = 'SH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const slug = data.name.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const newShop: Shop = {
      id,
      ownerId: 'USER-' + id,
      name: data.name,
      slug,
      description: `Official ${data.name} Pakistan Store. Quality guaranteed.`,
      logoUrl: '',
      status: ShopStatus.PENDING_ADMIN_APPROVAL, // Default to pending for safety
      verified: false,
      whatsappNumber: data.whatsapp,
      email: data.email,
      category: data.category,
      joinedAt: new Date().toISOString(),
      payoutInfo: data.payoutInfo,
      country: 'Pakistan'
    };

    db.shops.push(newShop);
    this.sync(db);
    return newShop;
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const db = this.getRegistry();
    return db.shops.find((s: Shop) => s.slug === slug) || null;
  }

  async fetchAllShops(): Promise<Shop[]> {
    return this.getRegistry().shops;
  }

  async updateShopStatus(shopId: string, status: ShopStatus): Promise<void> {
    const db = this.getRegistry();
    const shop = db.shops.find((s: Shop) => s.id === shopId);
    if (shop) {
      shop.status = status;
      this.sync(db);
    }
  }

  // --- PRODUCT ACTIONS ---
  async saveProduct(p: Product): Promise<void> {
    const db = this.getRegistry();
    const idx = db.products.findIndex((item: Product) => item.id === p.id);
    if (idx > -1) db.products[idx] = p;
    else db.products.push(p);
    this.sync(db);
  }

  async fetchProductsByShop(shopId: string): Promise<Product[]> {
    const db = this.getRegistry();
    return db.products.filter((p: Product) => p.shopId === shopId);
  }

  async fetchAllProducts(): Promise<Product[]> {
    return this.getRegistry().products;
  }

  // --- ORDER ACTIONS ---
  async saveOrder(order: Order): Promise<void> {
    const db = this.getRegistry();
    db.orders.push(order);
    this.sync(db);
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getRegistry().orders;
  }
}

export const api = new GlobalDatabaseService();
