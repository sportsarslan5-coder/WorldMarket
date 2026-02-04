
export interface Product {
  id: string;
  name: string;
  price: number; // Range: 35 - 40
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
  sellerData?: {
    email: string;
    country: string;
    city: string;
    contactNumber: string;
    paymentMethod: string;
    paymentDetails: string;
  };
}

export interface Seller {
  id: string;
  name: string;
  fullName?: string;
  storeName?: string;
  slug: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  whatsapp: string;
  country?: string;
  city?: string;
  contactNumber?: string;
  paymentMethod?: string;
  paymentDetails?: string;
  payoutInfo?: {
    method: string;
  };
  status?: 'active' | 'inactive';
}

export interface Order {
  id: string;
  showSlug: string;
  productName: string;
  productPrice: number;
  productId?: string;
  shopName?: string;
  sellerId?: string;
  sellerName?: string;
  sellerSlug?: string;
  sellerWhatsApp?: string;
  shopId?: string;
  totalAmount?: number;
  paymentMethod?: string;
  currency?: string;
  items?: any[];
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  customerLocation: string; // Country, City
  status: 'pending' | 'completed';
  createdAt: string;
  transactionId?: string;
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
