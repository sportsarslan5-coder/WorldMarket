
export enum ShopStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface PayoutInfo {
  method: 'Easypaisa' | 'JazzCash' | 'Bank' | 'Sadapay';
  accountNumber: string;
  accountTitle: string;
  bankName?: string;
}

export interface Seller {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  shopId: string;
  joinedAt: string;
  payoutInfo: PayoutInfo;
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
  views: number; // Views in millions
  currency: 'PKR';
  category: string;
  imageUrl: string; 
  stock: number;
  published: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
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
  paymentMethod: 'COD' | 'JazzCash' | 'Bank';
  paymentScreenshot?: string;
  transactionId?: string;
  paymentReference?: string;
  currency: 'PKR';
  createdAt: string;
  status: 'pending' | 'paid' | 'completed' | 'shipped' | 'delivered' | 'cancelled';
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
