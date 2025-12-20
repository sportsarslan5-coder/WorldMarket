
import { Seller, Product, Order } from '../types.ts';
import { mockSellers, mockProducts, mockOrders } from './mockData.ts';

const STORAGE_KEYS = {
  SELLERS: 'pkmart_sellers_v1',
  PRODUCTS: 'pkmart_products_v1',
  ORDERS: 'pkmart_orders_v1'
};

class DatabaseService {
  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(mockSellers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mockProducts));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrders));
    }
  }

  getSellers(): Seller[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.SELLERS);
    return data ? JSON.parse(data) : [];
  }

  saveSeller(seller: Seller) {
    const sellers = this.getSellers();
    const index = sellers.findIndex(s => s.id === seller.id);
    if (index > -1) {
      sellers[index] = seller;
    } else {
      sellers.push(seller);
    }
    localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(sellers));
  }

  getProducts(): Product[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  saveProduct(product: Product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  getOrders(): Order[] {
    this.initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }

  saveOrder(order: Order) {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  updateSellerStatus(sellerId: string, status: 'active' | 'inactive') {
    const sellers = this.getSellers();
    const updated = sellers.map(s => s.id === sellerId ? { ...s, status } : s);
    localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(updated));
    return updated;
  }
}

export const db = new DatabaseService();
