
export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  price: number;
  size: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  // Added optional views for landing page metrics
  views?: number;
}

export interface Seller {
  id: string;
  name: string;
  // Added optional corporate fields for registration and AI notifications
  fullName?: string;
  storeName: string;
  slug: string;
  location: string;
  whatsapp: string;
  // Added optional phone aliases
  phone?: string;
  phoneNumber?: string;
  email: string;
  bankAccount: string;
  registeredAt: string;
  // Added optional payout structure
  payoutInfo?: {
    method: string;
    accountNumber: string;
    accountTitle: string;
  };
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  sellerId: string;
  sellerName: string;
  sellerSlug: string;
  customerName: string;
  customerLocation: string;
  customerWhatsapp: string;
  customerEmail: string;
  commission: {
    adminAmount: number;  // 95%
    sellerAmount: number; // 5%
  };
  createdAt: string;
  // Added optional checkout and gateway fields
  shopId?: string;
  shopName?: string;
  sellerWhatsApp?: string;
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount?: number;
  paymentMethod?: string;
  currency?: string;
  status?: string;
  tid?: string;
}

// Added AdminNotification export for notificationService
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
