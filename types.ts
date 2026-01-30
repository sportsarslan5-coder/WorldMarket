
export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  price: number;
  size: string;
  color: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
  views?: number;
}

export interface Seller {
  id: string;
  name: string;
  fullName?: string;
  storeName: string;
  slug: string;
  location: string;
  whatsapp: string;
  phone?: string;
  phoneNumber?: string;
  email: string;
  bankAccount: string;
  registeredAt: string;
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
    adminAmount: number; // 95%
    sellerAmount: number; // 5%
  };
  createdAt: string;
  shopId?: string;
  shopName?: string;
  totalAmount?: number;
  paymentMethod?: string;
  status?: string;
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
