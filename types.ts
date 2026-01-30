
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
  // Added views to fix LandingPage error
  views?: number;
}

export interface Seller {
  id: string;
  name: string;
  storeName: string;
  slug: string;
  location: string;
  whatsapp: string;
  email: string;
  bankAccount: string;
  registeredAt: string;
  // properties used by notification service and mock data
  fullName?: string;
  phoneNumber?: string;
  phone?: string;
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
  // properties used by checkout/notification
  shopName?: string;
  totalAmount?: number;
  paymentMethod?: string;
  status?: string;
}

// Added missing AdminNotification interface
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
