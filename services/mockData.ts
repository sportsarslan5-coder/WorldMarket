
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';

export const mockSellers: Seller[] = [
  {
    id: 's1',
    fullName: 'Ahmed Khan',
    email: 'ahmed@example.pk',
    phoneNumber: '03001234567',
    payoutMethod: 'JazzCash',
    accountNumber: '03001234567',
    shopName: 'Ahmed Electronics',
    shopSlug: 'ahmed-electronics',
    joinedAt: '2024-01-01'
  },
  {
    id: 's2',
    fullName: 'Fatima Zahra',
    email: 'fatima@example.pk',
    phoneNumber: '03217654321',
    payoutMethod: 'Easypaisa',
    accountNumber: '03217654321',
    shopName: 'Zahra Fabrics',
    shopSlug: 'zahra-fabrics',
    joinedAt: '2024-02-15'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    sellerId: 's1',
    name: 'Wireless Bluetooth Buds',
    description: 'High quality bass with 20h battery life.',
    price: 2500,
    currency: 'PKR',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400',
    published: true,
    createdAt: '2024-03-01'
  },
  {
    id: 'p2',
    sellerId: 's2',
    name: 'Luxury Lawn Suit',
    description: 'Unstitched 3-piece luxury embroidered lawn suit.',
    price: 4500,
    currency: 'PKR',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=400',
    published: true,
    createdAt: '2024-03-05'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'PK-8821',
    sellerId: 's1',
    customerName: 'Zainab Bibi',
    customerPhone: '03331112223',
    customerEmail: 'zainab@example.com',
    customerAddress: 'House 12, St 4, DHA Phase 5, Lahore',
    items: [
      { productId: 'p1', productName: 'Wireless Bluetooth Buds', quantity: 1, price: 2500 }
    ],
    totalAmount: 2500,
    currency: 'PKR',
    paymentMethod: PaymentMethod.COD,
    status: OrderStatus.PENDING,
    commissionAmount: 125, // 2500 * 0.05
    createdAt: '2024-03-10T10:00:00Z'
  }
];
