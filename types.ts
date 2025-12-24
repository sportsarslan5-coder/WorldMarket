
export enum ShopStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface PayoutInfo {
  method: 'JazzCash' | 'Easypaisa' | 'Bank' | 'Stripe' | 'PayPal';
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
}

// Added Seller interface to fix import errors in App.tsx, services/mockData.ts, services/db.ts, and services/notificationService.ts
export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopId: string;
  joinedAt: string;
  payoutInfo?: PayoutInfo;
  status?: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  status: ShopStatus;
  verified: boolean;
  whatsappNumber: string;
  email: string;
  category: string;
  joinedAt: string;
  payoutInfo?: PayoutInfo;
  country: string;
}

export interface Product {
  id: string;
  sellerId: string; 
  sellerName: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string; 
  images: string[]; 
  sizes: string[]; 
  colors: string[]; 
  stock: number;
  published: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  sellerWhatsApp: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod: 'COD' | 'ONLINE';
  currency: string;
  createdAt: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
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