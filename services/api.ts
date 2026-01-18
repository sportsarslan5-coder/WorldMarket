
import { Shop, Product, Order, ShopStatus } from '../types.ts';
import { mockSellers, mockProducts } from './mockData.ts';

/**
 * USA SHOP GLOBAL CLOUD HUB
 * Persistent Storage & Network Management
 */
const ADMIN_PHONE = "+1234567890"; // Admin phone for global system alerts

class GlobalCloudHub {
  private static STORAGE_KEY = 'USA_SHOP_PERMANENT_DB_V2';

  private getMasterState() {
    const data = localStorage.getItem(GlobalCloudHub.STORAGE_KEY);
    if (!data) {
      // INITIAL SEEDING: If no data exists, convert mockData to the new schema
      const initialShops: Shop[] = mockSellers.map(s => ({
        id: s.shopId,
        ownerId: s.id,
        name: s.fullName + "'s Hub",
        slug: s.fullName.toLowerCase().replace(/\s+/g, '-'),
        description: "Official USA Shop Partner",
        status: ShopStatus.ACTIVE,
        whatsappNumber: s.phoneNumber,
        email: s.email,
        joinedAt: s.joinedAt,
        payoutInfo: s.payoutInfo
      }));

      const state = { 
        shops: initialShops, 
        products: mockProducts, 
        orders: [] 
      };
      this.sync(state);
      return state;
    }
    return JSON.parse(data);
  }

  private sync(state: any) {
    try {
      localStorage.setItem(GlobalCloudHub.STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Storage limit reached.", e);
      alert("System memory full. Please use smaller product images.");
    }
  }

  private triggerWhatsApp(message: string, phone: string) {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encoded}`;
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
      description: "Official Verified USA Shop Hub",
      status: ShopStatus.ACTIVE,
      whatsappNumber: data.whatsapp,
      email: data.email,
      joinedAt: new Date().toISOString()
    };

    state.shops.push(newShop);
    this.sync(state);

    const message = `*NEW SELLER REGISTERED*\n👤 Vendor: ${newShop.name}\n📞 WA: ${newShop.whatsappNumber}`;
    this.triggerWhatsApp(message, ADMIN_PHONE);
    return newShop;
  }

  async updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop> {
    const state = this.getMasterState();
    const index = state.shops.findIndex((s: Shop) => s.id === shopId);
    if (index === -1) throw new Error("Shop not found");
    state.shops[index] = { ...state.shops[index], ...updates };
    this.sync(state);
    return state.shops[index];
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

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const state = this.getMasterState();
    const index = state.products.findIndex((p: Product) => p.id === productId);
    if (index !== -1) {
      state.products[index] = { ...state.products[index], ...updates };
      this.sync(state);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    const state = this.getMasterState();
    state.products = state.products.filter((p: Product) => p.id !== productId);
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
    const message = `*🚨 NEW ORDER RECEIVED*\n\n📦 *PRODUCT*: ${item.productName}\n💰 *PRICE*: $${order.totalAmount.toLocaleString()}\n\n👤 Customer: ${order.customerName}\n📞 Phone: ${order.customerPhone}\n📍 Address: ${order.customerAddress}\n\n*Order ID*: ${order.id}`;

    // Send to both Admin and Seller
    this.triggerWhatsApp(message, order.sellerWhatsApp);
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudHub();
