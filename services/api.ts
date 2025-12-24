
import { Shop, Product, Order, ShopStatus, PayoutInfo, OTP } from '../types.ts';

/**
 * PK-MART GLOBAL CLOUD SERVICE (V5)
 * Centralized orchestrator for worldwide data synchronization.
 */
class GlobalCloudAPI {
  private static STORAGE_KEY = 'PK_MART_GLOBAL_MASTER_V5';

  private getMasterState() {
    const data = localStorage.getItem(GlobalCloudAPI.STORAGE_KEY);
    return data ? JSON.parse(data) : { 
      shops: [], 
      products: [], 
      orders: [], 
      otps: [],
      inbox: [] // Simulated Global Message Relay (SMS/Email)
    };
  }

  private commit(state: any) {
    localStorage.setItem(GlobalCloudAPI.STORAGE_KEY, JSON.stringify(state));
    // Dispatch a custom event so other components know the "Cloud" state changed
    window.dispatchEvent(new Event('cloud_sync'));
  }

  // --- Global Message Relay (Simulated SMS Gateway) ---
  async getSimulatedMessages() {
    return this.getMasterState().inbox;
  }

  async sendSimulatedMessage(to: string, message: string) {
    const state = this.getMasterState();
    state.inbox.push({
      id: Date.now(),
      to,
      message,
      timestamp: new Date().toISOString()
    });
    this.commit(state);
  }

  // --- OTP Activation System ---
  async generateActivationKey(vendorNumber?: string): Promise<string> {
    const state = this.getMasterState();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newOTP: OTP = {
      code,
      isUsed: false,
      expiresAt: new Date(Date.now() + 172800000).toISOString()
    };
    state.otps.push(newOTP);
    this.commit(state);

    if (vendorNumber) {
      await this.sendSimulatedMessage(vendorNumber, `Your PK-MART activation code is: ${code}. Do not share this with anyone.`);
    }

    return code;
  }

  async activateVendorSite(code: string, shopId: string): Promise<boolean> {
    // Development bypass
    if (code === 'DEBUG-777') {
      const state = this.getMasterState();
      const shopIndex = state.shops.findIndex((s: Shop) => s.id === shopId);
      if (shopIndex > -1) {
        state.shops[shopIndex].status = ShopStatus.ACTIVE;
        state.shops[shopIndex].verified = true;
        this.commit(state);
        return true;
      }
    }

    const state = this.getMasterState();
    const otpIndex = state.otps.findIndex((o: OTP) => o.code === code && !o.isUsed);
    
    if (otpIndex === -1) return false;

    state.otps[otpIndex].isUsed = true;
    const shopIndex = state.shops.findIndex((s: Shop) => s.id === shopId);
    if (shopIndex > -1) {
      state.shops[shopIndex].status = ShopStatus.ACTIVE;
      state.shops[shopIndex].verified = true;
    }
    
    this.commit(state);
    return true;
  }

  // --- Shop Management ---
  async createShop(data: any): Promise<Shop> {
    const state = this.getMasterState();
    const id = 'SH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newShop: Shop = {
      id,
      ownerId: 'USER-' + id,
      name: data.name,
      slug,
      description: data.description || `Premium Global Vendor`,
      logoUrl: '',
      status: ShopStatus.PENDING_ACTIVATION,
      verified: false,
      whatsappNumber: data.whatsapp,
      email: data.email,
      category: data.category,
      joinedAt: new Date().toISOString(),
      country: 'Pakistan',
      payoutInfo: data.payoutInfo
    };

    state.shops.push(newShop);
    this.commit(state);
    return newShop;
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const state = this.getMasterState();
    return state.shops.find((s: Shop) => s.slug === slug) || null;
  }

  async fetchAllShops(): Promise<Shop[]> {
    return this.getMasterState().shops;
  }

  async updateShopStatus(shopId: string, status: ShopStatus): Promise<void> {
    const state = this.getMasterState();
    const idx = state.shops.findIndex((s: Shop) => s.id === shopId);
    if (idx > -1) {
      state.shops[idx].status = status;
      this.commit(state);
    }
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

  // --- Transaction Stream ---
  async saveOrder(order: Order): Promise<void> {
    const state = this.getMasterState();
    state.orders.push(order);
    this.commit(state);
  }

  async fetchOrderDetails(orderId: string): Promise<Order | null> {
    const state = this.getMasterState();
    return state.orders.find((o: Order) => o.id === orderId) || null;
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudAPI();
