
export enum ShopStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface PayoutInfo {
  method: 'JazzCash' | 'Easypaisa' | 'Bank';
  accountNumber: string;
  accountTitle: string;
  // Added optional bankName for bank transfers
  bankName?: string;
}

// Added AdminNotification interface for dashboard alerts
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
  // Made status optional to match mock data
  status?: 'active' | 'inactive';
  // Added optional payoutInfo for registration tracking
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
  // Added optional payoutInfo for shop configuration
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
  // Added optional extended properties for mock data compatibility
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
  paymentMethod: 'COD';
  currency: 'PKR';
  createdAt: string;
  status: 'pending' | 'shipped' | 'delivered';
  // Added optional customer details and status for order tracking
  customerEmail?: string;
  paymentStatus?: 'paid' | 'unpaid';
}
