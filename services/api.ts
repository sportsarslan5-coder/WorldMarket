
import { Product, Seller, Order } from '../types.ts';
import { db } from './db.ts';

const ADMIN_WA = "923079490721";

class ApiService {
  private syncLocal(type: 'sellers' | 'products' | 'orders', data: any) {
    if (type === 'sellers') db.saveSeller(data);
    if (type === 'products') db.saveProduct(data);
    if (type === 'orders') db.saveOrder(data);
  }

  async registerSeller(data: Omit<Seller, 'id' | 'slug' | 'registeredAt'>): Promise<Seller> {
    const slug = data.storeName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      ...data,
      id: crypto.randomUUID(),
      slug,
      registeredAt: new Date().toISOString()
    };
    this.syncLocal('sellers', newSeller);
    return newSeller;
  }

  async fetchAllSellers(): Promise<Seller[]> {
    return db.getSellers();
  }

  async getSellerById(id: string): Promise<Seller | null> {
    return db.getSellers().find(s => s.id === id) || null;
  }

  async findSellerBySlug(slug: string): Promise<Seller | undefined> {
    return db.getSellers().find(s => s.slug === slug);
  }

  async getAllProducts(): Promise<Product[]> {
    return db.getProducts();
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return db.getProducts();
  }

  async uploadProduct(data: any): Promise<void> {
    const newProduct: Product = {
      ...data,
      id: `PRD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sellerId: 'ADMIN',
      sellerName: 'Admin Patch Shop'
    };
    this.syncLocal('products', newProduct);
  }

  async deleteProduct(id: string): Promise<void> {
    const products = db.getProducts().filter(p => p.id !== id);
    localStorage.setItem('pkmart_products_v1', JSON.stringify(products));
  }

  async fetchAllOrders(): Promise<Order[]> {
    return db.getOrders();
  }

  async initOrder(orderData: any): Promise<void> {
    const order: Order = {
      ...orderData,
      status: orderData.status || 'pending'
    };
    this.syncLocal('orders', order);
  }

  async finalizeOrder(orderId: string, status: string, transactionId: string): Promise<void> {
    const orders = db.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, status, transactionId } : o);
    localStorage.setItem('pkmart_orders_v1', JSON.stringify(updated));
  }

  async placeOrder(orderData: any): Promise<void> {
    const order: Order = {
      ...orderData,
      id: `APS-${Date.now()}`,
      createdAt: new Date().toISOString(),
      commission: {
        adminAmount: Number(orderData.productPrice) * 0.95,
        sellerAmount: Number(orderData.productPrice) * 0.05
      }
    };
    
    this.syncLocal('orders', order);

    const messageText = `*New Order – Admin Patch Shop*\n` +
      `--------------------------\n` +
      `*Name:* ${order.customerName}\n` +
      `*WhatsApp:* ${order.customerWhatsapp}\n` +
      `*Email:* ${order.customerEmail}\n` +
      `*Address:* ${order.customerLocation}\n` +
      `*Product:* ${order.productName}\n` +
      `*Price:* Rs. ${order.productPrice}\n` +
      `*Referred By:* /#/${order.sellerSlug}\n` +
      `--------------------------\n` +
      `*Status:* Awaiting Fulfillment`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(messageText)}`, '_blank');
  }
}

export const api = new ApiService();
