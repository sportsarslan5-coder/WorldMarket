
import { Product, Seller, Order } from '../types.ts';

/**
 * PRODUCTION CLOUD CONTROLLER
 * Uses standardized REST architecture for permanent data persistence.
 */
const CLOUD_DB_URL = "https://vshpgjexuqmrtxvytmzv.supabase.co/rest/v1"; // Production Node
const ADMIN_WA = "923079490721";

class ApiService {
  private get headers() {
    return {
      'Content-Type': 'application/json',
      'apikey': process.env.API_KEY || "",
      'Authorization': `Bearer ${process.env.API_KEY || ""}`,
      'Prefer': 'return=representation'
    };
  }

  // --- SELLER PERSISTENCE ---

  async registerSeller(data: Omit<Seller, 'id' | 'slug' | 'registeredAt'>): Promise<Seller> {
    const slug = data.storeName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      ...data,
      id: crypto.randomUUID(),
      slug,
      registeredAt: new Date().toISOString()
    };

    const res = await fetch(`${CLOUD_DB_URL}/sellers`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(newSeller)
    });

    if (!res.ok) throw new Error("Cloud Registration Failed");

    // AUTOMATIC WHATSAPP DISPATCH TO ADMIN
    this.sendWhatsApp(`*NEW SELLER ALERT*%0A
Name: ${newSeller.name}%0A
Store: ${newSeller.storeName}%0A
Location: ${newSeller.location}%0A
WA: ${newSeller.whatsapp}%0A
Email: ${newSeller.email}%0A
Bank: ${newSeller.bankAccount}`);

    return newSeller;
  }

  async fetchAllSellers(): Promise<Seller[]> {
    const res = await fetch(`${CLOUD_DB_URL}/sellers?select=*`, { headers: this.headers });
    return res.json();
  }

  // Alias for fetchAllSellers
  async fetchAllShops(): Promise<Seller[]> {
    return this.fetchAllSellers();
  }

  async findSellerBySlug(slug: string): Promise<Seller | null> {
    const res = await fetch(`${CLOUD_DB_URL}/sellers?slug=eq.${slug}&select=*`, { headers: this.headers });
    const data = await res.json();
    return data[0] || null;
  }

  // Alias for findSellerBySlug
  async fetchShopBySlug(slug: string): Promise<Seller | null> {
    return this.findSellerBySlug(slug);
  }

  async getSellerById(id: string): Promise<Seller | null> {
    const res = await fetch(`${CLOUD_DB_URL}/sellers?id=eq.${id}&select=*`, { headers: this.headers });
    const data = await res.json();
    return data[0] || null;
  }

  // --- PRODUCT PERSISTENCE ---

  async uploadProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    const res = await fetch(`${CLOUD_DB_URL}/products`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(newProduct)
    });

    if (!res.ok) throw new Error("Cloud Product Sync Failed");
    return newProduct;
  }

  // Used by AdminPanel
  async saveAdminProduct(product: any): Promise<Product> {
    return this.uploadProduct(product);
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    const res = await fetch(`${CLOUD_DB_URL}/products?sellerId=eq.${sellerId}&select=*`, { headers: this.headers });
    return res.json();
  }

  // Alias for getProductsBySeller
  async fetchSellerProducts(sellerId: string): Promise<Product[]> {
    return this.getProductsBySeller(sellerId);
  }

  async getAllProducts(): Promise<Product[]> {
    const res = await fetch(`${CLOUD_DB_URL}/products?select=*`, { headers: this.headers });
    return res.json();
  }

  // Alias for getAllProducts
  async fetchGlobalProducts(): Promise<Product[]> {
    return this.getAllProducts();
  }

  // Alias for getAllProducts
  async getAdminProducts(): Promise<Product[]> {
    return this.getAllProducts();
  }

  // --- ORDER & COMMISSION ENGINE ---

  // Initialize a pending order for checkout gateway
  async initOrder(orderData: any): Promise<void> {
    const mappedOrder = {
      ...orderData,
      customerWhatsapp: orderData.customerWhatsapp || orderData.customerPhone || "",
      customerLocation: orderData.customerLocation || orderData.customerAddress || ""
    };
    await this.placeOrder(mappedOrder);
  }

  async placeOrder(orderData: Omit<Order, 'id' | 'commission' | 'createdAt'>): Promise<void> {
    const adminAmt = orderData.productPrice * 0.95;
    const sellerAmt = orderData.productPrice * 0.05;

    const fullOrder: Order = {
      ...orderData,
      id: orderData.id || `ORD-${Date.now()}`,
      commission: {
        adminAmount: adminAmt,
        sellerAmount: sellerAmt
      },
      createdAt: new Date().toISOString()
    };

    const res = await fetch(`${CLOUD_DB_URL}/orders`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(fullOrder)
    });

    if (!res.ok) throw new Error("Order Persistence Failed");

    // AUTOMATIC WHATSAPP NOTIFICATION TO ADMIN
    this.sendWhatsApp(`*NEW ORDER RECEIVED*%0A
Seller: ${fullOrder.sellerName}%0A
Store: ${window.location.origin}/#/${fullOrder.sellerSlug}%0A
Product: ${fullOrder.productName}%0A
Price: Rs. ${fullOrder.productPrice}%0A
Customer: ${fullOrder.customerName}%0A
Address: ${fullOrder.customerLocation}%0A
WA: ${fullOrder.customerWhatsapp}`);
  }

  async fetchAllOrders(): Promise<Order[]> {
    const res = await fetch(`${CLOUD_DB_URL}/orders?select=*`, { headers: this.headers });
    return res.json();
  }

  // Finalize order status and record transaction ID
  async finalizeOrder(orderId: string, status: string, tid: string): Promise<void> {
    const res = await fetch(`${CLOUD_DB_URL}/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ status, transactionId: tid })
    });
    if (!res.ok) throw new Error("Order Finalization Failed");
  }

  private sendWhatsApp(text: string) {
    window.open(`https://wa.me/${ADMIN_WA}?text=${text}`, '_blank');
  }
}

export const api = new ApiService();
