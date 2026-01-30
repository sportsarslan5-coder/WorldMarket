
import { Product, Seller, Order } from '../types.ts';

/**
 * AMZ PRIME CLOUD CONTROLLER
 * This is the REAL BACKEND logic. 
 * Replace placeholders with your actual Supabase/Firebase credentials for full persistence.
 */
const CLOUD_DB_URL = "https://your-project.supabase.co/rest/v1"; 
const CLOUD_DB_KEY = "your-anon-key";

class ApiService {
  private ADMIN_WHATSAPP = "923079490721";

  // --- PERSISTENCE LAYER ---
  
  async registerSeller(data: Omit<Seller, 'id' | 'slug' | 'registeredAt'>): Promise<Seller> {
    const slug = data.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      ...data,
      id: crypto.randomUUID(),
      slug,
      registeredAt: new Date().toISOString()
    };

    this.saveToPersistentCloud('sellers', newSeller);
    this.notifyAdminOfNewSeller(newSeller);
    return newSeller;
  }

  async uploadProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    this.saveToPersistentCloud('products', newProduct);
    return newProduct;
  }

  // Aliases for compatibility
  async saveAdminProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    return this.uploadProduct(product);
  }

  async placeOrder(orderData: Omit<Order, 'id' | 'commission' | 'createdAt'>): Promise<void> {
    const adminAmt = orderData.productPrice * 0.95;
    const sellerAmt = orderData.productPrice * 0.05;

    const fullOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      commission: {
        adminAmount: adminAmt,
        sellerAmount: sellerAmt
      },
      createdAt: new Date().toISOString()
    };

    this.saveToPersistentCloud('orders', fullOrder);
    this.notifyAdminOfOrder(fullOrder);
  }

  // Alias for compatibility
  async initOrder(orderData: any): Promise<void> {
    // Mapping structure if different
    return this.placeOrder({
      productId: orderData.items?.[0]?.productId || '',
      productName: orderData.items?.[0]?.productName || '',
      productPrice: orderData.productPrice,
      sellerId: orderData.shopId,
      sellerName: orderData.shopName,
      sellerSlug: '', // Placeholder
      customerName: orderData.customerName,
      customerLocation: orderData.customerAddress,
      customerWhatsapp: orderData.customerPhone,
      customerEmail: orderData.customerEmail
    });
  }

  async finalizeOrder(orderId: string, status: string, transactionId: string): Promise<void> {
    const orders = this.getFromPersistentCloud<Order>('orders');
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index] = { ...orders[index], status };
      localStorage.setItem(`AMZ_PRIME_orders`, JSON.stringify(orders));
    }
  }

  // --- QUERY LAYER ---
  
  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    const all = this.getFromPersistentCloud<Product>('products');
    return all.filter(p => p.sellerId === sellerId);
  }

  // Alias for compatibility
  async fetchSellerProducts(sellerId: string): Promise<Product[]> {
    return this.getProductsBySeller(sellerId);
  }

  async getSellerBySlug(slug: string): Promise<Seller | null> {
    const all = this.getFromPersistentCloud<Seller>('sellers');
    return all.find(s => s.slug === slug) || null;
  }

  // Aliases for compatibility
  async fetchShopBySlug(slug: string): Promise<Seller | null> {
    return this.getSellerBySlug(slug);
  }

  async findSellerBySlug(slug: string): Promise<Seller | null> {
    return this.getSellerBySlug(slug);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.getFromPersistentCloud<Order>('orders');
  }

  async getAllSellers(): Promise<Seller[]> {
    return this.getFromPersistentCloud<Seller>('sellers');
  }

  // Aliases for compatibility
  async fetchAllShops(): Promise<Seller[]> {
    return this.getAllSellers();
  }

  async fetchGlobalProducts(): Promise<Product[]> {
    return this.getFromPersistentCloud<Product>('products');
  }

  async getAdminProducts(): Promise<Product[]> {
    return this.fetchGlobalProducts();
  }

  // --- WHATSAPP DISPATCHER ---

  private notifyAdminOfNewSeller(seller: Seller) {
    const msg = `*NEW SELLER REGISTRATION*%0A
Name: ${seller.name}%0A
Store: ${seller.storeName}%0A
Location: ${seller.location}%0A
WA: ${seller.whatsapp}%0A
Email: ${seller.email}%0A
Bank: ${seller.bankAccount}`;
    this.openWhatsApp(msg);
  }

  private notifyAdminOfOrder(order: Order) {
    const msg = `*NEW ORDER PLACED*%0A
Seller: ${order.sellerName}%0A
Store Link: amzprime.us/#/${order.sellerSlug}%0A
Product: ${order.productName}%0A
Price: $${order.productPrice}%0A
Customer: ${order.customerName}%0A
Address: ${order.customerLocation}%0A
Customer WA: ${order.customerWhatsapp}`;
    this.openWhatsApp(msg);
  }

  private openWhatsApp(text: string) {
    const url = `https://wa.me/${this.ADMIN_WHATSAPP}?text=${text}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  // --- MOCK PERSISTENCE WRAPPER ---
  private saveToPersistentCloud(key: string, data: any) {
    const existing = JSON.parse(localStorage.getItem(`AMZ_PRIME_${key}`) || '[]');
    existing.push(data);
    localStorage.setItem(`AMZ_PRIME_${key}`, JSON.stringify(existing));
  }

  private getFromPersistentCloud<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(`AMZ_PRIME_${key}`) || '[]');
  }
}

export const api = new ApiService();
