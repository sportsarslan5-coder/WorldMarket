
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shop, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';
import { api } from '../services/api.ts';

const ADMIN_WHATSAPP_NUMBER = "923079490721";

const ShopFront: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [cart, setCart] = useState<{product: Product, quantity: number, size?: string}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadShopData = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const foundShop = await api.fetchShopBySlug(slug);
        if (foundShop) {
          setShop(foundShop);
          const shopProducts = await api.fetchProductsByShop(foundShop.id);
          setProducts(shopProducts);
        }
      } catch (err) {
        console.error("Failed to load shop:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadShopData();
  }, [slug]);

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const addToCart = (product: Product, size?: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id && c.size === size);
      if (existing) {
        return prev.map(c => (c.product.id === product.id && c.size === size) ? {...c, quantity: c.quantity + 1} : c);
      }
      return [...prev, { product, quantity: 1, size }];
    });
    setSelectedProduct(null);
    setSelectedSize('');
  };

  const submitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !shop) return;

    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      shopId: shop.id,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      items: cart.map(c => ({
        productId: c.product.id,
        productName: c.product.name,
        productImageUrl: c.product.imageUrl,
        quantity: c.quantity,
        price: c.product.price,
        size: c.size
      })),
      totalAmount: total,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    await api.saveOrder(newOrder);

    // WHATSAPP WEBHOOK PAYLOAD
    const itemsList = cart.map(i => `- ${i.product.name} (Qty: ${i.quantity}, Size: ${i.size || 'N/A'})\n📸 Image: ${i.product.imageUrl}`).join('\n\n');
    const msg = `*🚨 NEW ORDER: ${orderId}*\n\n*SHOP:* ${shop.name}\n*TOTAL:* Rs. ${total.toLocaleString()}\n\n*ITEMS:*\n${itemsList}\n\n*CUSTOMER:*\n👤 ${customerInfo.name}\n📞 ${customerInfo.phone}\n📍 ${customerInfo.address}`;
    
    window.open(`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setOrderPlaced(true);
    setCart([]);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Cloud Shop...</div>;
  if (!shop) return <div className="min-h-screen flex flex-col items-center justify-center">Shop Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Dynamic Shop UI */}
      <nav className="bg-[#131921] text-white p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black">PK-MART</Link>
          <button onClick={() => setShowCheckout(true)} className="relative">
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>
            🛒
          </button>
        </div>
      </nav>

      <header className="bg-white py-20 text-center border-b">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter">{shop.name}</h1>
        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Official Trusted Vendor</p>
      </header>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border group">
            <div className="h-60 bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center p-4">
               <img src={p.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500" alt="" />
            </div>
            <h3 className="font-bold text-lg mb-2">{p.name}</h3>
            <div className="text-2xl font-black text-emerald-600 mb-6">Rs. {p.price.toLocaleString()}</div>
            <button onClick={() => setSelectedProduct(p)} className="w-full bg-[#ffd814] py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition">View Options</button>
          </div>
        ))}
      </main>

      {/* Checkout Modal Simplified */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-10 flex flex-col">
            <h2 className="text-3xl font-black mb-10">Checkout</h2>
            <div className="flex-1 overflow-auto space-y-4">
              {cart.map((c, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border">
                  <img src={c.product.imageUrl} className="w-12 h-12 object-contain" alt="" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{c.product.name}</p>
                    <p className="text-xs text-slate-400">Qty: {c.quantity} • {c.size || 'Std'}</p>
                  </div>
                  <p className="font-black">Rs. {c.product.price}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              <input placeholder="Name" className="w-full p-4 bg-slate-50 border rounded-xl" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              <input placeholder="Phone" className="w-full p-4 bg-slate-50 border rounded-xl" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
              <textarea placeholder="Address" className="w-full p-4 bg-slate-50 border rounded-xl h-24" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
              <button onClick={submitOrder} className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-black text-lg">Confirm via WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {orderPlaced && (
         <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-5xl font-black mb-4 italic uppercase">Success!</h2>
            <p className="text-slate-500 mb-10">Admin notified. Your order with {shop.name} is being processed.</p>
            <Link to="/" className="bg-[#febd69] px-10 py-4 rounded-xl font-black">Back to Home</Link>
         </div>
      )}
    </div>
  );
};

export default ShopFront;
