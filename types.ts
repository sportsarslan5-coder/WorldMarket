
export enum ShopStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface PayoutInfo {
  method: 'PayPal' | 'Stripe' | 'Bank' | 'Venmo';
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
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

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopId: string;
  joinedAt: string;
  status?: 'active' | 'inactive';
  payoutInfo?: PayoutInfo;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  status: ShopStatus;
  whatsappNumber: string;
  email: string;
  joinedAt: string;
  payoutInfo?: PayoutInfo;
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
  size?: string;
  stock: number;
  published: boolean;
  createdAt: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number;
  size?: string;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  sellerWhatsApp: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'COD' | 'CARD';
  currency: 'USD';
  createdAt: string;
  status: 'pending' | 'shipped' | 'delivered';
  customerEmail?: string;
  paymentStatus?: 'paid' | 'unpaid';
}
