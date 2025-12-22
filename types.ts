
export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export enum PaymentMethod {
  COD = 'Cash on Delivery',
  BANK_TRANSFER = 'Bank Transfer'
}

export type SellerPayoutMethod = 'JazzCash' | 'Easypaisa' | 'Bank Transfer';

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  status: 'active' | 'inactive';
  verified: boolean;
}

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  payoutMethod: SellerPayoutMethod;
  accountNumber: string;
  bankName?: string;
  shopId: string; // Linked to Shop
  joinedAt: string;
  // Added fields to match application usage and mock data
  status?: 'active' | 'inactive';
  shopName?: string;
  shopSlug?: string;
}

export interface Product {
  id: string;
  shopId: string; // Critical: Linked to Shop, not just Seller
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images: string[];
  sizes: string[];
  stock: number;
  published: boolean;
  createdAt: string;
  // Added field to match mock data
  sellerId?: string;
}

export interface Order {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    productName: string;
    productImageUrl: string;
    quantity: number;
    price: number;
    size?: string;
  }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  // Added fields to match application usage and notifications
  sellerId?: string;
  sellerName?: string;
}

export interface AdminNotification {
  id: string;
  type: 'NEW_SELLER' | 'NEW_ORDER';
  timestamp: string;
  content: {
    whatsapp: string;
    email: string;
  };
  // Added field to satisfy notification logic
  sent?: boolean;
}
