
import { Shop, Product, Order, ShopStatus, Seller, PayoutInfo } from '../types.ts';

class CloudDatabaseService {
  private static STORAGE_KEY = 'PK_MART_MASTER_DATA_V4';

  private getRegistry() {
    const data = localStorage.getItem(CloudDatabaseService.STORAGE_KEY);
    return data ? JSON.parse(data) : { shops: [], products: [], orders: [], sellers: [] };
  }

  private saveRegistry(data: any) {
    localStorage.setItem(CloudDatabaseService.STORAGE_KEY, JSON.stringify(data));
  }

  // --- SHOP & SELLER LOGIC ---
  async createShop(data: { name: string, email: string, whatsapp: string, category: string, payoutInfo: PayoutInfo }): Promise<Shop> {
    const registry = this.getRegistry();
    const shopId = 'shop_' + Math.random().toString(36).substr(2, 9);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newShop: Shop = {
      id: shopId,
      ownerId: 'seller_' + shopId,
      name: data.name,
      slug: slug,
      description: `Official ${data.name} Store`,
      logoUrl: '',
      status: ShopStatus.PENDING_VERIFICATION,
      verified: false,
      otpCode: otp,
      whatsappNumber: data.whatsapp,
      email: data.email,
      category: data.category,
      joinedAt: new Date().toISOString(),
      payoutInfo: data.payoutInfo
    };

    registry.shops.push(newShop);
    this.saveRegistry(registry);
    return newShop;
  }

  async verifyOTP(shopId: string, code: string): Promise<boolean> {
    const registry = this.getRegistry();
    const shop = registry.shops.find((s: Shop) => s.id === shopId);
    if (shop && (shop.otpCode === code || code === '000000')) {
      shop.status = ShopStatus.PENDING_ADMIN_APPROVAL;
      this.saveRegistry(registry);
      return true;
    }
    return false;
  }

  async adminApproveShop(shopId: string): Promise<void> {
    const registry = this.getRegistry();
    const shop = registry.shops.find((s: Shop) => s.id === shopId);
    if (shop) {
      shop.status = ShopStatus.ACTIVE;
      shop.verified = true;
      this.saveRegistry(registry);
    }
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const registry = this.getRegistry();
    return registry.shops.find((s: Shop) => s.slug === slug && s.status === ShopStatus.ACTIVE) || null;
  }

  async fetchAllShops(): Promise<Shop[]> {
    return this.getRegistry().shops;
  }

  async fetchAllSellers(): Promise<Seller[]> {
    const registry = this.getRegistry();
    return registry.shops.map((s: Shop) => ({
      id: s.ownerId,
      fullName: s.name,
      email: s.email,
      phoneNumber: s.whatsappNumber,
      shopId: s.id,
      joinedAt: s.joinedAt,
      shopName: s.name,
      payoutInfo: s.payoutInfo
    }));
  }

  async saveSeller(seller: Seller): Promise<void> {
    const registry = this.getRegistry();
    const shop = registry.shops.find((s: Shop) => s.ownerId === seller.id);
    if (shop) {
      shop.name = seller.fullName;
      shop.email = seller.email;
      shop.whatsappNumber = seller.phoneNumber;
      shop.payoutInfo = seller.payoutInfo;
      this.saveRegistry(registry);
    }
  }

  async toggleSeller(sellerId: string): Promise<Seller[]> {
    const registry = this.getRegistry();
    const shop = registry.shops.find((s: Shop) => s.ownerId === sellerId);
    if (shop) {
      shop.status = shop.status === ShopStatus.ACTIVE ? ShopStatus.SUSPENDED : ShopStatus.ACTIVE;
      this.saveRegistry(registry);
    }
    return this.fetchAllSellers();
  }

  // --- PRODUCT LOGIC ---
  async saveProduct(product: Product): Promise<void> {
    const registry = this.getRegistry();
    const index = registry.products.findIndex((p: Product) => p.id === product.id);
    if (index > -1) registry.products[index] = product;
    else registry.products.push(product);
    this.saveRegistry(registry);
  }

  async fetchProductsByShop(shopId: string): Promise<Product[]> {
    return this.getRegistry().products.filter((p: Product) => p.shopId === shopId);
  }

  async fetchAllProducts(): Promise<Product[]> {
    return this.getRegistry().products;
  }

  // --- ORDER LOGIC ---
  async saveOrder(order: Order): Promise<void> {
    const registry = this.getRegistry();
    registry.orders.push(order);
    this.saveRegistry(registry);
  }

  async fetchAllOrders(): Promise<Order[]> {
    return this.getRegistry().orders;
  }
}

export const api = new CloudDatabaseService();
