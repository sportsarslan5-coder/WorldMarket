
import { Seller, Product, Order } from '../types.ts';

export const mockSellers: Seller[] = [
  {
    id: 's1',
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phoneNumber: '+15550101010',
    shopId: 's1',
    joinedAt: '2024-01-01',
    payoutInfo: {
      method: 'PayPal',
      accountNumber: 'john.smith@example.com',
      accountTitle: 'John Smith'
    }
  },
  {
    id: 's3',
    fullName: 'Mike Miller',
    email: 'mike.sports@example.com',
    phoneNumber: '+15550303030',
    shopId: 's3',
    joinedAt: '2024-03-01',
    payoutInfo: {
      method: 'Bank',
      accountNumber: '1234567890',
      accountTitle: 'Mike Miller',
      bankName: 'Chase Bank'
    }
  },
  {
    id: 's4',
    fullName: 'Global Freight Hub',
    email: 'logistics@usashop.com',
    phoneNumber: '+15550999999',
    shopId: 's4',
    joinedAt: '2024-04-01'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p-best-beez',
    sellerId: 's3',
    sellerName: 'Mike Miller',
    name: 'New Beez 22 - Grid Jersey',
    description: 'Authentic New Beez 22 basketball jersey. Featuring custom honeycomb tech-fabric and precision multilingual embroidery.',
    price: 145.00,
    currency: 'USD',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 
    stock: 100,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-best-1',
    sellerId: 's4',
    sellerName: 'Global Freight Hub',
    name: 'Peace Fedex - Global Node',
    description: 'Exclusive priority shipping node for Peace-certified logistics. Guaranteed global transit for all mobile nodes.',
    price: 12500.00,
    currency: 'USD',
    category: 'Logistics',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    stock: 5,
    published: true,
    createdAt: '2024-04-01'
  },
  {
    id: 'p-best-beef',
    sellerId: 's4',
    sellerName: 'Global Freight Hub',
    name: 'Beef Protect - Bio-Shield',
    description: 'Advanced climate-controlled bio-shield for premium meat preservation. Industrial grade security.',
    price: 5200.00,
    currency: 'USD',
    category: 'Food Tech',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    stock: 10,
    published: true,
    createdAt: '2024-04-05'
  },
  {
    id: 'p1',
    sellerId: 's1',
    sellerName: 'Smith Electronics',
    name: 'Wireless Pro Buds',
    description: 'Noise cancelling Bluetooth 5.3 earbuds. USA Shop Exclusive.',
    price: 49.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    stock: 50,
    published: true,
    createdAt: '2024-03-01'
  }
];

export const mockOrders: Order[] = [];
