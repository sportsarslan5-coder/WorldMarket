
import { Seller, Product, Order } from '../types.ts';

// Fix: Imported Seller interface which is now defined in types.ts

export const mockSellers: Seller[] = [
  {
    id: 's1',
    fullName: 'Ahmed Khan',
    email: 'ahmed.k@gmail.com',
    phoneNumber: '03001234567',
    shopId: 's1',
    joinedAt: '2024-01-01',
    payoutInfo: {
      method: 'JazzCash',
      accountNumber: '03001234567',
      accountTitle: 'Ahmed Khan'
    }
  },
  {
    id: 's2',
    fullName: 'Fatima Zahra',
    email: 'f.zahra@gmail.com',
    phoneNumber: '03217654321',
    shopId: 's2',
    joinedAt: '2024-02-15',
    payoutInfo: {
      method: 'Easypaisa',
      accountNumber: '03217654321',
      accountTitle: 'Fatima Zahra'
    }
  },
  {
    id: 's3',
    fullName: 'Salman Sheikh',
    email: 'salman.sports@gmail.com',
    phoneNumber: '03450009988',
    shopId: 's3',
    joinedAt: '2024-03-01',
    payoutInfo: {
      method: 'Bank',
      accountNumber: 'PK12ALPH000001234567',
      accountTitle: 'Salman Sheikh',
      bankName: 'Alfalah Bank'
    }
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    sellerId: 's1',
    // Fix: Added missing sellerName
    sellerName: 'Ahmed Electronics',
    name: 'Wireless Pro Buds',
    description: 'Noise cancelling Bluetooth 5.3 earbuds with 40h playtime.',
    price: 3500,
    currency: 'PKR',
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
    // Fix: Added missing sellerName
    sellerName: 'Fatima Fashion',
    name: 'Embroidered Lawn Dress',
    description: '3-Piece premium unstitched collection for Summer 2024.',
    price: 5200,
    currency: 'PKR',
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
    // Fix: Added missing sellerName
    sellerName: 'Salman Sports',
    name: 'Cricket Willow Bat (G1)',
    description: 'Grade 1 English Willow professional cricket bat.',
    price: 15500,
    currency: 'PKR',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400',
    images: [],
    sizes: [],
    colors: ['Natural'],
    stock: 12,
    published: true,
    createdAt: '2024-03-08'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'PK-MAR-1001',
    shopId: 's1',
    shopName: 'Ahmed Electronics',
    // Fix: Added missing sellerWhatsApp
    sellerWhatsApp: '03001234567',
    customerName: 'Zainab Bibi',
    customerPhone: '03331112223',
    customerEmail: 'zainab@example.com',
    customerAddress: 'House 12, St 4, DHA Phase 5, Lahore',
    items: [
      { 
        productId: 'p1', 
        productName: 'Wireless Pro Buds', 
        productImageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        quantity: 1, 
        price: 3500 
      }
    ],
    totalAmount: 3500,
    paymentMethod: 'COD',
    paymentStatus: 'unpaid',
    currency: 'PKR',
    createdAt: '2024-03-10T10:00:00Z',
    status: 'pending'
  }
];