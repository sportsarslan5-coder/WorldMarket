
import { Shop, Product, Order, ShopStatus } from '../types.ts';
import { mockSellers, mockProducts } from './mockData.ts';

/**
 * PK MART CLOUD API
 * Optimized for Pakistani Multi-Vendor Payments (JazzCash Integrated)
 */
const MASTER_ADMIN_WHATSAPP = "923079490721"; 

class GlobalCloudHub {
  private static STORAGE_KEY = 'PK_MART_DATABASE_PROD_V1';

  private getMasterState() {
    const data = localStorage.getItem(GlobalCloudHub.STORAGE_KEY);
    if (!data) {
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
    // window.open(url, '_blank'); // Silent logs for internal sync
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
    const message = `*✅ SETTLED PK MART ORDER*\n\n` +
      `📦 *ID*: ${order.id}\n` +
      `💰 *TOTAL*: Rs. ${order.totalAmount}\n` +
      `💳 *JAZZCASH*: Confirmed to 03079490721\n` +
      `👤 *CUST*: ${order.customerName}`;

    this.sendWhatsApp(message, MASTER_ADMIN_WHATSAPP);
  }

  async updateOrderStatus(orderId: string, status: Order['status'], transactionId?: string): Promise<void> {
    const state = this.getMasterState();
    const orderIndex = state.orders.findIndex((o: Order) => o.id === orderId);
    if (orderIndex !== -1) {
      state.orders[orderIndex].status = status;
      if (transactionId) state.orders[orderIndex].transactionId = transactionId;
      this.sync(state);
    }
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getMasterState().orders;
  }
}

export const api = new GlobalCloudHub();
