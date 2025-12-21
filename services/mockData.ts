
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';

export const mockSellers: Seller[] = [
  {
    id: 's1',
    fullName: 'Ahmed Khan',
    email: 'ahmed.k@gmail.com',
    phoneNumber: '03001234567',
    payoutMethod: 'JazzCash',
    accountNumber: '03001234567',
    shopName: 'Ahmed Electronics',
    shopSlug: 'ahmed-electronics',
    joinedAt: '2024-01-01',
    status: 'active'
  },
  {
    id: 's2',
    fullName: 'Fatima Zahra',
    email: 'f.zahra@gmail.com',
    phoneNumber: '03217654321',
    payoutMethod: 'Easypaisa',
    accountNumber: '03217654321',
    shopName: 'Zahra Fabrics',
    shopSlug: 'zahra-fabrics',
    joinedAt: '2024-02-15',
    status: 'active'
  },
  {
    id: 's3',
    fullName: 'Salman Sheikh',
    email: 'salman.sports@gmail.com',
    phoneNumber: '03450009988',
    payoutMethod: 'Bank Transfer',
    accountNumber: 'PK12ALPH000001234567',
    bankName: 'Alfalah Bank',
    shopName: 'Salman Sports',
    shopSlug: 'salman-sports',
    joinedAt: '2024-03-01',
    status: 'active'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    sellerId: 's1',
    shopId: 's1',
    name: 'Wireless Pro Buds',
    description: 'Noise cancelling Bluetooth 5.3 earbuds with 40h playtime.',
    price: 3500,
    category: 'Electronics',
    rating: 4.8,
    reviewsCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    // Added missing properties to satisfy Product interface
    images: [],
    sizes: [],
    stock: 50,
    published: true,
    createdAt: '2024-03-01'
  },
  {
    id: 'p2',
    sellerId: 's2',
    shopId: 's2',
    name: 'Embroidered Lawn Dress',
    description: '3-Piece premium unstitched collection for Summer 2024.',
    price: 5200,
    category: 'Fashion',
    rating: 4.5,
    reviewsCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
    // Added missing properties to satisfy Product interface
    images: [],
    sizes: ['S', 'M', 'L'],
    stock: 35,
    published: true,
    createdAt: '2024-03-05'
  },
  {
    id: 'p3',
    sellerId: 's3',
    shopId: 's3',
    name: 'Cricket Willow Bat (G1)',
    description: 'Grade 1 English Willow professional cricket bat.',
    price: 15500,
    category: 'Sports',
    rating: 4.9,
    reviewsCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
    // Added missing properties to satisfy Product interface
    images: [],
    sizes: [],
    stock: 12,
    published: true,
    createdAt: '2024-03-08'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'PK-MAR-1001',
    sellerId: 's1',
    sellerName: 'Ahmed Electronics',
    customerName: 'Zainab Bibi',
    customerPhone: '03331112223',
    customerEmail: 'zainab@example.com',
    customerAddress: 'House 12, St 4, DHA Phase 5, Lahore',
    items: [
      // Fix: Added productImageUrl to satisfy the Order interface requirements (Line 111)
      { 
        productId: 'p1', 
        productName: 'Wireless Pro Buds', 
        productImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        quantity: 1, 
        price: 3500 
      }
    ],
    totalAmount: 3500,
    currency: 'PKR',
    paymentMethod: PaymentMethod.COD,
    status: OrderStatus.PENDING,
    commissionAmount: 175,
    createdAt: '2024-03-10T10:00:00Z'
  }
];
