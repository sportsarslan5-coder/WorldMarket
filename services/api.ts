
import { Shop, Product, Order, ShopStatus } from '../types.ts';

const ADMIN_WHATSAPP = "03079490721";

class GlobalCloudAPI {
  private static STORAGE_KEY = 'PK_MART_PRODUCTION_V1';

  private getMasterState() {
    const data = localStorage.getItem(GlobalCloudAPI.STORAGE_KEY);
    return data ? JSON.parse(data) : { 
      shops: [], 
      products: [], 
      orders: [] 
    };
  }

  private commit(state: any) {
    localStorage.setItem(GlobalCloudAPI.STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('storage')); // Notify all windows/tabs
  }

  // --- WhatsApp Relay Service ---
  private sendToAdminWhatsApp(msg: string) {
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encoded}`, '_blank');
  }

  // --- Shop Management (Automatic Activation) ---
  async createShop(data: any): Promise<Shop> {
    const state = this.getMasterState();
    const id = 'SH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newShop: Shop = {
      id,
      ownerId: 'USER-' + id,
      name: data.name,
      slug,
      description: data.description || `Premium Vendor on PK-MART`,
      logoUrl: '',
      status: ShopStatus.ACTIVE, // Immediate Activation
      verified: true,
      whatsappNumber: data.whatsapp,
      email: data.email,
      category: data.category,
      joinedAt: new Date().toISOString(),
      country: 'Pakistan'
    };

    state.shops.push(newShop);
    this.commit(state);

    // Notification to Admin
    this.sendToAdminWhatsApp(`*NEW SELLER ALERT*\n\nStore: ${newShop.name}\nWhatsApp: ${newShop.whatsappNumber}\nCategory: ${newShop.category}\nLink: /shop/${newShop.slug}`);

    return newShop;
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const state = this.getMasterState();
    return state.shops.find((s: Shop) => s.slug === slug) || null;
  }

  async fetchAllShops(): Promise<Shop[]> {
    return this.getMasterState().shops;
  }

  // --- Global Product Inventory ---
  async saveProduct(product: Product): Promise<void> {
    const state = this.getMasterState();
    const idx = state.products.findIndex((p: Product) => p.id === product.id);
    if (idx > -1) state.products[idx] = product;
    else state.products.push(product);
    this.commit(state);
  }

  async fetchAllProducts(): Promise<Product[]> {
    return this.getMasterState().products;
  }

  async fetchProductsBySeller(sellerId: string): Promise<Product[]> {
    const state = this.getMasterState();
    return state.products.filter((p: Product) => p.sellerId === sellerId);
  }

  // --- Order System ---
  async saveOrder(order: Order): Promise<void> {
    const state = this.getMasterState();
    state.orders.push(order);
    this.commit(state);

    // Deep Payload for Admin WhatsApp
    const item = order.items[0];
    const msg = `*NEW GLOBAL ORDER*\n\nOrder ID: ${order.id}\nProduct: ${item.productName}\nPrice: Rs. ${order.totalAmount.toLocaleString()}\n\n*Customer Details:*\nName: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.customerAddress}\n\n*Seller Details:*\nStore: ${order.shopName}\nSeller WA: ${order.sellerWhatsApp}`;
    
    this.sendToAdminWhatsApp(msg);
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudAPI();
