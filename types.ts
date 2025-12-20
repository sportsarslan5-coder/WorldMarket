
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum PaymentMethod {
  COD = 'Cash on Delivery',
  BANK_TRANSFER = 'Bank Transfer (Admin Account)'
}

export type SellerPayoutMethod = 'JazzCash' | 'Easypaisa' | 'Bank Transfer';

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  payoutMethod: SellerPayoutMethod;
  accountNumber: string;
  bankName?: string;
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
  category: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  published: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  sellerId: string;
  sellerName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
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
  commissionAmount: number; // 5% for the seller
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'NEW_SELLER' | 'NEW_ORDER';
  timestamp: string;
  content: {
    whatsapp: string;
    email: string;
  };
  sent: boolean;
}
