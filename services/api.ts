
import { Shop, Product, Order, ShopStatus } from '../types.ts';

/**
 * PK-MART GLOBAL CLOUD HUB
 * Specialized for the Pakistani Multi-Vendor Market.
 * Centralized data management for cross-device persistence.
 */
const ADMIN_PHONE = "03079490721";

class GlobalCloudHub {
  private static CLOUD_KEY = 'PK_MART_GLOBAL_DATA_V2';

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
    // Broadcast for cross-tab and cross-device simulation
    window.dispatchEvent(new Event('storage'));
  }

  // --- Universal WhatsApp Relay ---
  private triggerWhatsApp(message: string) {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encoded}`;
    window.open(url, '_blank');
  }

  // --- Seller Registration (Full Data Persistence) ---
  async registerSeller(data: { name: string, whatsapp: string, email: string }): Promise<Shop> {
    const state = this.getMasterState();
    const id = 'NODE-' + Math.random().toString(36).substr(2, 7).toUpperCase();
    
    // Generate clean URL slug
    const slug = data.name.toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const newShop: Shop = {
      id,
      ownerId: 'USR-' + id,
      name: data.name,
      slug,
      description: "Official Global Vendor Node - PK-MART Verified",
      logoUrl: '',
      status: ShopStatus.ACTIVE,
      verified: true,
      whatsappNumber: data.whatsapp,
      email: data.email,
      category: "General",
      joinedAt: new Date().toISOString(),
      country: 'Pakistan'
    };

    state.shops.push(newShop);
    this.sync(state);

    // Formulate complete Shop Link
    const shopLink = `${window.location.origin}/#/shop/${newShop.slug}`;

    // SEND FULL DATA TO ADMIN WHATSAPP
    const message = `*NEW SELLER REGISTRATION*\n\n` +
      `👤 Name: ${newShop.name}\n` +
      `📞 WhatsApp: ${newShop.whatsappNumber}\n` +
      `📧 Email: ${newShop.email}\n` +
      `🔗 Shop Link: ${shopLink}\n\n` +
      `Node ID: ${newShop.id}\n` +
      `Action: Account Auto-Activated.`;

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

  // --- Product Management ---
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

  // --- Ordering System (Full Detail Relay) ---
  async placeOrder(order: Order): Promise<void> {
    const state = this.getMasterState();
    state.orders.push(order);
    this.sync(state);

    const item = order.items[0];
    const shopLink = `${window.location.origin}/#/shop/${order.shopId}`; // Fallback or derived

    const message = `*URGENT: NEW PK-MART ORDER*\n\n` +
      `📦 Product: ${item.productName}\n` +
      `💰 Price: Rs. ${order.totalAmount.toLocaleString()}\n` +
      `🔢 Order ID: ${order.id}\n\n` +
      `*CUSTOMER INFO*\n` +
      `👤 Name: ${order.customerName}\n` +
      `📞 Phone: ${order.customerPhone}\n` +
      `📍 Address: ${order.customerAddress}\n\n` +
      `*VENDOR INFO*\n` +
      `🏪 Store: ${order.shopName}\n` +
      `📞 Seller WA: ${order.sellerWhatsApp}`;

    this.triggerWhatsApp(message);
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudHub();
