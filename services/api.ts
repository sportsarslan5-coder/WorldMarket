
import { Seller, Product, Order, Shop } from '../types.ts';
import { mockSellers, mockProducts, mockOrders } from './mockData.ts';

/**
 * CLOUD API GATEWAY
 * This service replaces the local-only storage.
 * In a real Vercel/Next.js app, these would be calls to:
 * - supabase.from('products').select('*')
 * - firebase.firestore().collection('orders').add(order)
 */
class CloudApiService {
  // We use a shared in-memory object for this session to simulate a central DB.
  // On a real server, this would be a persistent SQL/NoSQL DB.
  private static centralRegistry: {
    sellers: Seller[];
    products: Product[];
    orders: Order[];
    shops: Shop[];
  } = {
    sellers: [...mockSellers.map(s => ({ ...s, shopId: s.id }))], // Mapping mock
    products: [...mockProducts],
    orders: [...mockOrders],
    shops: mockSellers.map(s => ({
      id: s.id,
      ownerId: s.id,
      // Fix: Access shopName and shopSlug which are now part of the Seller interface
      name: s.shopName || 'Untitled Shop',
      slug: s.shopSlug || s.id,
      description: 'Official Store',
      logoUrl: '',
      status: 'active',
      verified: true
    }))
  };

  async fetchShops(): Promise<Shop[]> {
    return CloudApiService.centralRegistry.shops;
  }

  async fetchShopBySlug(slug: string): Promise<Shop | null> {
    const shops = await this.fetchShops();
    return shops.find(s => s.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  async fetchProductsByShop(shopId: string): Promise<Product[]> {
    return CloudApiService.centralRegistry.products.filter(p => p.shopId === shopId);
  }

  async fetchAllProducts(): Promise<Product[]> {
    return CloudApiService.centralRegistry.products;
  }

  async fetchAllSellers(): Promise<Seller[]> {
    return CloudApiService.centralRegistry.sellers;
  }

  async fetchAllOrders(): Promise<Order[]> {
    return CloudApiService.centralRegistry.orders;
  }

  async saveShop(shop: Shop) {
    const index = CloudApiService.centralRegistry.shops.findIndex(s => s.id === shop.id);
    if (index > -1) CloudApiService.centralRegistry.shops[index] = shop;
    else CloudApiService.centralRegistry.shops.push(shop);
  }

  async saveSeller(seller: Seller) {
    const index = CloudApiService.centralRegistry.sellers.findIndex(s => s.id === seller.id);
    if (index > -1) CloudApiService.centralRegistry.sellers[index] = seller;
    else CloudApiService.centralRegistry.sellers.push(seller);
  }

  async saveProduct(product: Product) {
    const index = CloudApiService.centralRegistry.products.findIndex(p => p.id === product.id);
    if (index > -1) CloudApiService.centralRegistry.products[index] = product;
    else CloudApiService.centralRegistry.products.push(product);
  }

  async saveOrder(order: Order) {
    CloudApiService.centralRegistry.orders.push(order);
  }

  async toggleShopStatus(shopId: string): Promise<Shop[]> {
    CloudApiService.centralRegistry.shops = CloudApiService.centralRegistry.shops.map(s => 
      s.id === shopId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    );
    return CloudApiService.centralRegistry.shops;
  }

  // Fix: Added toggleSeller method for AdminDashboard to toggle vendor status
  async toggleSeller(sellerId: string): Promise<Seller[]> {
    CloudApiService.centralRegistry.sellers = CloudApiService.centralRegistry.sellers.map(s => 
      s.id === sellerId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    );
    return CloudApiService.centralRegistry.sellers;
  }
}

export const api = new CloudApiService();
