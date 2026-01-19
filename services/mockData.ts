
import { Seller, Product } from '../types.ts';

export const mockSellers: Seller[] = [
  {
    id: 's1',
    fullName: 'Ahmed Ali Electronics',
    email: 'ahmed.ali@pkmart.pk',
    phoneNumber: '+923001234567',
    shopId: 's1',
    joinedAt: '2024-01-01',
    payoutInfo: {
      method: 'Easypaisa',
      accountNumber: '03001234567',
      accountTitle: 'Ahmed Ali'
    }
  },
  {
    id: 's2',
    fullName: 'Zainab Boutique',
    email: 'zainab.fashion@example.pk',
    phoneNumber: '+923219876543',
    shopId: 's2',
    joinedAt: '2024-02-15',
    payoutInfo: {
      method: 'Bank',
      accountNumber: 'PK00MEZN0001020304',
      accountTitle: 'Zainab Fashion Pvt Ltd',
      bankName: 'Meezan Bank'
    }
  },
  {
    id: 's3',
    fullName: 'Sialkot Sports Hub',
    email: 'exports@sialkotsports.pk',
    phoneNumber: '+923151122334',
    shopId: 's3',
    joinedAt: '2024-03-01',
    payoutInfo: {
      method: 'JazzCash',
      accountNumber: '03151122334',
      accountTitle: 'Irfan Khan'
    }
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p-best-1',
    sellerId: 's3',
    sellerName: 'Sialkot Sports Hub',
    name: 'Official Match Football (FIFA Grade)',
    description: 'Professional hand-stitched football from Sialkot. Premium aerodynamic design with high durability.',
    price: 4500.00,
    currency: 'PKR',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', 
    stock: 500,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-best-3',
    sellerId: 's3',
    sellerName: 'Sialkot Sports Hub',
    name: 'Custom Team Jersey - Double AA Edition',
    description: 'Sublimated high-performance moisture-wicking fabric. Customizable for local cricket and football teams.',
    price: 1850.00,
    currency: 'PKR',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1580087442629-1237105ee608?w=800',
    stock: 1000,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-best-2',
    sellerId: 's2',
    sellerName: 'Zainab Boutique',
    name: 'Embroidered Lawn 3-Piece Suit',
    description: 'Luxury summer lawn collection with intricate embroidery and silk dupatta. Limited edition design.',
    price: 8500.00,
    currency: 'PKR',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
    stock: 45,
    published: true,
    createdAt: '2024-04-01'
  },
  {
    id: 'p1',
    sellerId: 's1',
    sellerName: 'Ahmed Ali Electronics',
    name: 'Super Bass Bluetooth Buds',
    description: 'Premium noise-cancelling earbuds with 40-hour battery life. PK MART Verified.',
    price: 2499.00,
    currency: 'PKR',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    stock: 120,
    published: true,
    createdAt: '2024-03-10'
  }
];

export const mockOrders: any[] = [];
