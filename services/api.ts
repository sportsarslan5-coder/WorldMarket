
import { Shop, Product, Order, ShopStatus } from '../types.ts';

/**
 * PK-MART GLOBAL CLOUD HUB
 * This service acts as the gateway to the permanent database.
 * To use a real backend like Supabase, swap the localStorage calls with fetch() or supabase.from().
 */
const ADMIN_PHONE = "03079490721";

class GlobalCloudHub {
  private static STORAGE_KEY = 'PK_MART_PERMANENT_DB_V3';

  private getMasterState() {
    const data = localStorage.getItem(GlobalCloudHub.STORAGE_KEY);
    return data ? JSON.parse(data) : { 
      shops: [], 
      products: [], 
      orders: [] 
    };
  }

  private sync(state: any) {
    localStorage.setItem(GlobalCloudHub.STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('storage'));
  }

  // Universal WhatsApp Logic
  private triggerWhatsApp(message: string) {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encoded}`;
    window.open(url, '_blank');
  }

  // --- SELLER OPERATIONS ---
  async registerSeller(data: { name: string, whatsapp: string, email: string }): Promise<Shop> {
    const state = this.getMasterState();
    const id = 'NODE-' + Math.random().toString(36).substr(2, 7).toUpperCase();
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newShop: Shop = {
      id,
      ownerId: 'USR-' + id,
      name: data.name,
      slug,
      description: "Official Verified PK-MART Hub",
      status: ShopStatus.ACTIVE,
      whatsappNumber: data.whatsapp,
      email: data.email,
      joinedAt: new Date().toISOString()
    };

    state.shops.push(newShop);
    this.sync(state);

    const message = `*NEW SELLER REGISTERED*\n\n` +
      `👤 Vendor: ${newShop.name}\n` +
      `📞 WhatsApp: ${newShop.whatsappNumber}\n` +
      `🔗 Shop URL: ${window.location.origin}/#/shop/${newShop.slug}\n\n` +
      `Platform: PK-MART GLOBAL`;

    this.triggerWhatsApp(message);
    return newShop;
  }

  async fetchAllShops(): Promise<Shop[]> {
    return this.getMasterState().shops;
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const state = this.getMasterState();
    return state.shops.find((s: Shop) => s.slug === slug) || null;
  }

  // --- PRODUCT OPERATIONS ---
  async uploadProduct(product: Product): Promise<void> {
    const state = this.getMasterState();
    state.products.push(product);
    this.sync(state);
  }

  async fetchGlobalProducts(): Promise<Product[]> {
    return this.getMasterState().products;
  }

  async fetchSellerProducts(sellerId: string): Promise<Product[]> {
    return this.getMasterState().products.filter((p: Product) => p.sellerId === sellerId);
  }

  // --- ORDER OPERATIONS ---
  async placeOrder(order: Order): Promise<void> {
    const state = this.getMasterState();
    state.orders.push(order);
    this.sync(state);

    const item = order.items[0];
    const message = `*🚨 NEW ORDER RECEIVED*\n\n` +
      `📦 *PRODUCT*: ${item.productName}\n` +
      `📐 *SIZE*: ${item.size || 'Standard'}\n` +
      `💰 *PRICE*: Rs. ${order.totalAmount.toLocaleString()}\n\n` +
      `*CUSTOMER DETAILS*\n` +
      `👤 Name: ${order.customerName}\n` +
      `📞 Phone: ${order.customerPhone}\n` +
      `📍 Address: ${order.customerAddress}\n\n` +
      `*VENDOR DETAILS*\n` +
      `🏪 Store: ${order.shopName}\n` +
      `📱 Seller WA: ${order.sellerWhatsApp}\n\n` +
      `*Order ID*: ${order.id}`;

    this.triggerWhatsApp(message);
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudHub();
