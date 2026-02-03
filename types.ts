
export interface Product {
  id: string;
  name: string;
  price: number; // Fixed at 35
  imageUrl: string;
  category: string;
  description: string;
  createdAt?: string;
}

export interface Show {
  id: string;
  name: string;
  slug: string;
  sellerName: string;
  whatsapp: string;
  createdAt: string;
}

export interface Seller {
  id: string;
  name: string;
  storeName?: string;
  slug: string;
  email: string;
  phone: string;
  whatsapp: string;
  phoneNumber?: string;
  fullName?: string;
  payoutInfo?: {
    method: string;
  };
  location?: string;
  bankAccount?: string;
  status?: 'active' | 'inactive';
}

export interface Order {
  id: string;
  showSlug: string;
  productName: string;
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string;
  status: 'pending' | 'completed';
  createdAt: string;
  // Extended properties for various storefronts and notification service
  productId?: string;
  productPrice?: number;
  customerLocation?: string;
  customerEmail?: string;
  shopName?: string;
  sellerName?: string;
  sellerId?: string;
  sellerSlug?: string;
  totalAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  shopId?: string;
  sellerWhatsApp?: string;
  items?: any[];
  currency?: string;
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
