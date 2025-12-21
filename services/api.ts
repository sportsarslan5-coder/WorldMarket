
import { Seller, Product, Order } from '../types.ts';
import { mockSellers, mockProducts, mockOrders } from './mockData.ts';

/**
 * GLOBAL API SERVICE
 * In a production Vercel environment, these methods would call:
 * fetch('/api/sellers') or supabase.from('sellers').select('*')
 */
class ApiService {
  private isInitialLoad = true;

  // Simulation of a remote global database
  private async getGlobalData<T>(key: string, fallback: T[]): Promise<T[]> {
    const data = localStorage.getItem(`global_pkmart_${key}`);
    if (!data && this.isInitialLoad) {
      return fallback;
    }
    return data ? JSON.parse(data) : [];
  }

  private async saveGlobalData<T>(key: string, data: T[]) {
    localStorage.setItem(`global_pkmart_${key}`, JSON.stringify(data));
  }

  async fetchSellers(): Promise<Seller[]> {
    return this.getGlobalData('sellers', mockSellers);
  }

  async fetchProducts(): Promise<Product[]> {
    return this.getGlobalData('products', mockProducts);
  }

  async fetchOrders(): Promise<Order[]> {
    return this.getGlobalData('orders', mockOrders);
  }

  async saveSeller(seller: Seller) {
    const sellers = await this.fetchSellers();
    const index = sellers.findIndex(s => s.id === seller.id);
    if (index > -1) {
      sellers[index] = seller;
    } else {
      sellers.push(seller);
    }
    await this.saveGlobalData('sellers', sellers);
  }

  async saveProduct(product: Product) {
    const products = await this.fetchProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    await this.saveGlobalData('products', products);
  }

  async saveOrder(order: Order) {
    const orders = await this.fetchOrders();
    orders.push(order);
    await this.saveGlobalData('orders', orders);
  }

  async toggleSeller(sellerId: string): Promise<Seller[]> {
    const sellers = await this.fetchSellers();
    const updated = sellers.map(s => 
      s.id === sellerId ? { ...s, status: (s.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : s
    );
    await this.saveGlobalData('sellers', updated);
    return updated;
  }
}

export const api = new ApiService();
