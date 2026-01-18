
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
    id: 's2',
    fullName: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phoneNumber: '+15550202020',
    shopId: 's2',
    joinedAt: '2024-02-15',
    payoutInfo: {
      method: 'Stripe',
      accountNumber: 'acct_123456789',
      accountTitle: 'Sarah Johnson'
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
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    sellerId: 's1',
    sellerName: 'Smith Electronics',
    name: 'Wireless Pro Buds',
    description: 'Noise cancelling Bluetooth 5.3 earbuds with 40h playtime.',
    price: 49.99,
    currency: 'USD',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    images: [],
    sizes: [],
    colors: ['White', 'Black'],
    stock: 50,
    published: true,
    createdAt: '2024-03-01'
  },
  {
    id: 'p2',
    sellerId: 's2',
    sellerName: 'Sarah Fashion',
    name: 'Summer Linen Dress',
    description: 'Elegant linen dress for the 2024 summer season.',
    price: 89.00,
    currency: 'USD',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
    images: [],
    sizes: ['S', 'M', 'L'],
    colors: ['Rose', 'Deep Blue'],
    stock: 35,
    published: true,
    createdAt: '2024-03-05'
  },
  {
    id: 'p3',
    sellerId: 's3',
    sellerName: 'Miller Sports',
    name: 'Professional Basketball',
    description: 'Official size and weight professional indoor/outdoor basketball.',
    price: 29.95,
    currency: 'USD',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1519861155730-0b5fbd0dd899?w=400',
    images: [],
    sizes: [],
    colors: ['Orange'],
    stock: 12,
    published: true,
    createdAt: '2024-03-08'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'US-ORD-1001',
    shopId: 's1',
    shopName: 'Smith Electronics',
    sellerWhatsApp: '+15550101010',
    customerName: 'Alice Cooper',
    customerPhone: '+15550404040',
    customerEmail: 'alice@example.com',
    customerAddress: '123 Maple St, Los Angeles, CA 90001',
    items: [
      { 
        productId: 'p1', 
        productName: 'Wireless Pro Buds', 
        productImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        quantity: 1, 
        price: 49.99 
      }
    ],
    totalAmount: 49.99,
    paymentMethod: 'CARD',
    paymentStatus: 'paid',
    currency: 'USD',
    createdAt: '2024-03-10T10:00:00Z',
    status: 'pending'
  }
];
