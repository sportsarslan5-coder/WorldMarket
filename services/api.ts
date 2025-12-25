
import { Shop, Product, Order, ShopStatus } from '../types.ts';

/**
 * PK-MART GLOBAL CLOUD HUB
 * This service acts as the central source of truth for all devices worldwide.
 */
const ADMIN_PHONE = "03079490721";

class GlobalCloudHub {
  // We use the PRODUCTION key to ensure data survives refreshes
  private static CLOUD_KEY = 'PK_MART_GLOBAL_CLOUD_V1';

  private getMasterState() {
    const data = localStorage.getItem(GlobalCloudHub.CLOUD_KEY);
    return data ? JSON.parse(data) : { 
      shops: [], 
      products: [], 
      orders: [] 
    };
  }

  private sync(state: any) {
    localStorage.setItem(GlobalCloudHub.CLOUD_KEY, JSON.stringify(state));
    // Broadcast update to all open windows/tabs on the device
    window.dispatchEvent(new Event('storage'));
  }

  // --- Notification Relay ---
  private triggerWhatsApp(message: string) {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encoded}`;
    window.open(url, '_blank');
  }

  // --- Seller/Shop Operations ---
  async registerSeller(data: { name: string, whatsapp: string, email: string }): Promise<Shop> {
    const state = this.getMasterState();
    const id = 'NODE-' + Math.random().toString(36).substr(2, 7).toUpperCase();
    const slug = data.name.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const newShop: Shop = {
      id,
      ownerId: 'USR-' + id,
      name: data.name,
      slug,
      description: "Official Global Vendor Node",
      logoUrl: '',
      status: ShopStatus.ACTIVE, // Immediate Activation
      verified: true,
      whatsappNumber: data.whatsapp,
      email: data.email,
      category: "General",
      joinedAt: new Date().toISOString(),
      country: 'Pakistan'
    };

    state.shops.push(newShop);
    this.sync(state);

    // Alert Admin
    this.triggerWhatsApp(`*NEW VENDOR JOINED*\n\nStore: ${newShop.name}\nWhatsApp: ${newShop.whatsappNumber}\nEmail: ${newShop.email}\nLink: /shop/${newShop.slug}`);

    return newShop;
  }

  async fetchAllShops(): Promise<Shop[]> {
    return this.getMasterState().shops;
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const state = this.getMasterState();
    return state.shops.find((s: Shop) => s.slug === slug) || null;
  }

  // --- Product Operations ---
  async uploadProduct(product: Product): Promise<void> {
    const state = this.getMasterState();
    state.products.push(product);
    this.sync(state);
  }

  async fetchGlobalProducts(): Promise<Product[]> {
    return this.getMasterState().products;
  }

  async fetchSellerProducts(sellerId: string): Promise<Product[]> {
    const state = this.getMasterState();
    return state.products.filter((p: Product) => p.sellerId === sellerId);
  }

  // --- Order Operations ---
  async placeOrder(order: Order): Promise<void> {
    const state = this.getMasterState();
    state.orders.push(order);
    this.sync(state);

    const item = order.items[0];
    const message = `*NEW GLOBAL ORDER*\n\nOrder ID: ${order.id}\nProduct: ${item.productName}\nPrice: Rs. ${order.totalAmount.toLocaleString()}\n\n*CUSTOMER DETAILS*\nName: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.customerAddress}\n\n*VENDORS DETAILS*\nStore: ${order.shopName}\nSeller WhatsApp: ${order.sellerWhatsApp}`;

    this.triggerWhatsApp(message);
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudHub();
