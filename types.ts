
export enum ShopStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PENDING_ADMIN_APPROVAL = 'PENDING_ADMIN_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface PayoutInfo {
  method: 'JazzCash' | 'Easypaisa' | 'Bank' | 'Stripe' | 'PayPal';
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
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
  shopId: string;
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
  isPriority?: boolean;
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
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'unpaid' | 'paid' | 'payout_processed';
  paymentMethod: 'COD' | 'ONLINE';
  currency: string;
  createdAt: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopId: string;
  joinedAt: string;
  shopName?: string;
  // Fix: Added payoutInfo to Seller interface to match usage in mock data and components
  payoutInfo?: PayoutInfo;
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