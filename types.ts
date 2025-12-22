
export enum ShopStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PENDING_ADMIN_APPROVAL = 'PENDING_ADMIN_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface PayoutInfo {
  method: 'JazzCash' | 'Easypaisa' | 'Bank';
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
  otpCode?: string; 
  whatsappNumber: string;
  email: string;
  category: string;
  joinedAt: string;
  payoutInfo?: PayoutInfo;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string; 
  images: string[]; 
  sizes: string[];
  colors: string[];
  stock: number;
  published: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
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
    color?: string;
  }[];
  totalAmount: number;
  paymentStatus: 'unpaid' | 'paid' | 'payout_processed';
  paymentMethod: 'COD' | 'ONLINE';
  createdAt: string;
}

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopId: string;
  joinedAt: string;
  shopName?: string; // Virtual property for notifications
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
