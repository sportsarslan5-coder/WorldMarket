
import { Seller, Product } from '../types.ts';

// Correcting mock sellers to match the updated Seller interface
export const mockSellers: Seller[] = [
  {
    id: 's1',
    name: 'Prime Design Labs',
    fullName: 'Prime Design Labs',
    storeName: 'Prime Design Labs Official',
    whatsapp: '+1 (555) 890-2341',
    phone: '+1 (555) 890-2341',
    phoneNumber: '+1 (555) 890-2341',
    email: 'admin@primelabs.us',
    slug: 'prime-design-labs',
    location: 'San Francisco, CA',
    bankAccount: 'US-CHECK-4492',
    registeredAt: '2024-01-01',
    payoutInfo: {
      method: '2Checkout',
      accountNumber: '****4492',
      accountTitle: 'Prime Design Labs LLC'
    }
  }
];

const rawData: [string, number, string][] = [
  ["Titanium Framework Smartphone", 999.00, "Electronics"],
  ["Ultra-Slim M3 Laptop", 1499.00, "Electronics"],
  ["Active Noise Cancelling Headphones", 299.00, "Electronics"],
  ["Professional Studio Monitor 4K", 649.00, "Electronics"],
  ["Carbon-Fiber Elite Runner", 185.00, "Footwear"],
  ["Italian Leather Oxford", 225.00, "Footwear"],
  ["High-Top Tech Sneaker", 140.00, "Footwear"],
  ["Premium Merino Wool Hoodie", 115.00, "Apparel"],
  ["Waterproof Tech Shell Jacket", 245.00, "Outerwear"],
  ["Modular Commuter Backpack", 135.00, "Bags"],
  ["Luxe Travel Duffel - Black", 210.00, "Bags"],
  ["Sapphire Glass Smartwatch", 399.00, "Electronics"],
  ["Polarized Aviator Frames", 155.00, "Accessories"],
  ["Full-Grain Leather Wallet", 65.00, "Accessories"]
];

const categoryImages: Record<string, string> = {
  "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
  "Footwear": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
  "Apparel": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
  "Outerwear": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
  "Bags": "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800",
  "Accessories": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"
};

export const mockProducts: Product[] = rawData.map((item, index) => {
  const [name, price, category] = item;
  return {
    id: `US-PRD-${index + 1}`,
    sellerId: 's1',
    sellerName: 'Prime Design Labs',
    name,
    description: `The ${name} represents the pinnacle of modern design. Engineered for the US market with premium materials and unmatched attention to detail.`,
    price,
    size: "Universal",
    color: "Multi", // Added missing color property to satisfy Product interface
    views: Math.floor(Math.random() * 50) / 10 + 1.2,
    category,
    imageUrl: `${categoryImages[category] || categoryImages["Accessories"]}&sig=${index}`,
    createdAt: new Date().toISOString()
  };
});

export const mockOrders = [];
