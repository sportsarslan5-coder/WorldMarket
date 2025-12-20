
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types';

export const mockSellers: Seller[] = [
  {
    id: 's1',
    fullName: 'Marco Rossi',
    email: 'marco@example.com',
    phoneNumber: '+39 340 123 4567',
    country: 'Italy',
    paymentType: 'PayPal',
    accountDetails: 'marco.rossi@payments.com',
    shopName: 'Venice Artisans',
    shopSlug: 'venice-artisans',
    joinedAt: '2023-10-01'
  },
  {
    id: 's2',
    fullName: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phoneNumber: '+1 555 0101',
    country: 'USA',
    paymentType: 'Stripe',
    accountDetails: 'acct_1NbX2k2...',
    shopName: 'Jenkins Home Goods',
    shopSlug: 'jenkins-home',
    joinedAt: '2023-11-15'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    sellerId: 's1',
    name: 'Handcrafted Glass Vase',
    description: 'Authentic Murano glass vase, handcrafted in Venice.',
    price: 120,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1578500484721-539c712f1f6c?auto=format&fit=crop&q=80&w=400',
    published: true,
    createdAt: '2023-12-01'
  },
  {
    id: 'p2',
    sellerId: 's2',
    name: 'Organic Cotton Blanket',
    description: 'Eco-friendly, ultra-soft organic cotton throw blanket.',
    price: 45,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=400',
    published: true,
    createdAt: '2023-12-05'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    sellerId: 's1',
    customerName: 'John Doe',
    customerPhone: '+44 7700 900000',
    customerEmail: 'john@doe.co.uk',
    customerAddress: '221B Baker St, London',
    customerCountry: 'United Kingdom',
    items: [
      { productId: 'p1', productName: 'Handcrafted Glass Vase', quantity: 1, price: 120 }
    ],
    totalAmount: 120,
    currency: 'USD',
    paymentMethod: PaymentMethod.STRIPE,
    status: OrderStatus.PENDING,
    commissionAmount: 6, // 120 * 0.05
    createdAt: '2024-01-10T10:00:00Z'
  }
];
