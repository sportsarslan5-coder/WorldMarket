
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum PaymentMethod {
  COD = 'Cash on Delivery',
  STRIPE = 'Stripe / Credit Card',
  PAYPAL = 'PayPal',
  BANK_TRANSFER = 'International Bank Transfer'
}

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  paymentType: 'PayPal' | 'Stripe' | 'Bank Transfer' | 'Other';
  accountDetails: string;
  shopName: string;
  shopSlug: string;
  joinedAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  published: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  sellerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCountry: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  commissionAmount: number; // 5% of total
  createdAt: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Paid';
  date: string;
}
