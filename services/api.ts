
import { Shop, Product, Order, ShopStatus } from '../types.ts';
import { mockSellers, mockProducts } from './mockData.ts';

/**
 * PK MART CLOUD API
 * This service handles all data persistence.
 * Swap 'localStorage' calls with your Supabase/Firebase SDK calls for production.
 */
const MASTER_ADMIN_WHATSAPP = "923079490721"; 

class GlobalCloudHub {
  private static STORAGE_KEY = 'PK_MART_DATABASE_PROD_V1';

  private getMasterState() {
    const data = localStorage.getItem(GlobalCloudHub.STORAGE_KEY);
    if (!data) {
      // Initializing DB with Sialkot Mock Data
      // Added payoutInfo mapping to ensure data flow to Shop interface
      const initialShops: Shop[] = mockSellers.map(s => ({
        id: s.shopId,
        ownerId: s.id,
        name: s.fullName,
        slug: s.fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: "Verified PK MART Export Partner",
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
    localStorage.setItem(GlobalCloudHub.STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('storage'));
  }

  private sendWhatsApp(message: string, phone: string) {
    const cleanPhone = phone.replace(/\+/g, '').replace(/\s/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  async registerSeller(data: { name: string, whatsapp: string, email: string }): Promise<Shop> {
    const state = this.getMasterState();
    const id = 'PK-' + Math.random().toString(36).substr(2, 7).toUpperCase();
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newShop: Shop = {
      id,
      ownerId: 'USR-' + id,
      name: data.name,
      slug,
      description: "Official PK MART Merchant",
      status: ShopStatus.ACTIVE,
      whatsappNumber: data.whatsapp,
      email: data.email,
      joinedAt: new Date().toISOString()
    };

    state.shops.push(newShop);
    this.sync(state);

    // Notify Admin of new registration
    const adminMsg = `🚨 *NEW MERCHANT REGISTERED*\n\nShop: ${newShop.name}\nWhatsApp: ${newShop.whatsappNumber}\nEmail: ${newShop.email}\nURL: pkmart.pk/shop/${newShop.slug}`;
    this.sendWhatsApp(adminMsg, MASTER_ADMIN_WHATSAPP);

    return newShop;
  }

  async fetchAllShops(): Promise<Shop[]> {
    return this.getMasterState().shops;
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const state = this.getMasterState();
    return state.shops.find((s: Shop) => s.slug === slug) || null;
  }

  async uploadProduct(product: Product): Promise<void> {
    const state = this.getMasterState();
    state.products.push(product);
    this.sync(state);
  }

  async updateProduct(id: string, product: Product): Promise<void> {
    const state = this.getMasterState();
    const idx = state.products.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      state.products[idx] = product;
      this.sync(state);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const state = this.getMasterState();
    state.products = state.products.filter((p: any) => p.id !== id);
    this.sync(state);
  }

  async fetchGlobalProducts(): Promise<Product[]> {
    return this.getMasterState().products;
  }

  async fetchSellerProducts(sellerId: string): Promise<Product[]> {
    return this.getMasterState().products.filter((p: Product) => p.sellerId === sellerId);
  }

  async placeOrder(order: Order): Promise<void> {
    const state = this.getMasterState();
    state.orders.push(order);
    this.sync(state);

    const item = order.items[0];
    const message = `*🚨 NEW PK MART ORDER*\n\n` +
      `📦 *PRODUCT*: ${item.productName}\n` +
      `💰 *TOTAL*: Rs. ${order.totalAmount.toLocaleString()}\n` +
      `👤 *CUSTOMER*: ${order.customerName}\n` +
      `📞 *PHONE*: ${order.customerPhone}\n` +
      `📍 *ADDRESS*: ${order.customerAddress}\n\n` +
      `🏢 *SELLER*: ${order.shopName}\n` +
      `🆔 *ORDER ID*: ${order.id}`;

    // Send to Admin
    this.sendWhatsApp(message, MASTER_ADMIN_WHATSAPP);
    
    // Optionally also send to Seller if they differ
    if (order.sellerWhatsApp !== MASTER_ADMIN_WHATSAPP) {
      this.sendWhatsApp(message, order.sellerWhatsApp);
    }
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudHub();
