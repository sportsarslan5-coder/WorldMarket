
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

interface ShopFrontProps {
  onNotify?: (type: 'NEW_ORDER' | 'NEW_SELLER', data: any) => Promise<void>;
}

const ShopFront: React.FC<ShopFrontProps> = ({ onNotify }) => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<{p: Product, qty: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const init = async () => {
      if (!slug) return;
      setIsLoading(true);
      const found = await api.fetchShopBySlug(slug);
      if (found) {
        setShop(found);
        const p = await api.fetchProductsByShop(found.id);
        setProducts(p);
      }
      setIsLoading(false);
    };
    init();
  }, [slug]);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.p.id === p.id);
      if (existing) return prev.map(item => item.p.id === p.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { p, qty: 1 }];
    });
  };

  const submitOrder = async () => {
    if (!customer.name || !customer.phone || !shop) return;
    const orderId = 'WS-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const total = cart.reduce((s, i) => s + (i.p.price * i.qty), 0);
    
    const newOrder: Order = {
      id: orderId,
      shopId: shop.id,
      shopName: shop.name,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      items: cart.map(i => ({
        productId: i.p.id,
        productName: i.p.name,
        productImageUrl: i.p.imageUrl,
        quantity: i.qty,
        price: i.p.price
      })),
      totalAmount: total,
      paymentStatus: 'unpaid',
      paymentMethod: 'COD',
      currency: 'PKR',
      createdAt: new Date().toISOString()
    };

    await api.saveOrder(newOrder);
    if (onNotify) await onNotify('NEW_ORDER', newOrder);

    const itemsList = cart.map(i => `- ${i.p.name} (x${i.qty})`).join('\n');
    const msg = `*WORLD-SHOP ORDER: ${orderId}*\n*Vendor:* ${shop.name}\n\n*Items:*\n${itemsList}\n\n*Total:* Rs. ${total.toLocaleString()}`;
    window.open(`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    
    setCart([]);
    setShowCheckout(false);
    alert("Order submitted to Global Hub.");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
       <h1 className="text-4xl font-black text-slate-900 mb-6">Store Offline</h1>
       <Link to="/" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs">Back to Hub</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900">
      <nav className="glass sticky top-0 z-50 p-6 flex justify-between items-center border-b border-slate-200/50">
        <Link to="/" className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
           <span className="bg-slate-900 text-white px-1.5 rounded">W</span>
           WORLD<span className="text-blue-600">SHOP</span>
        </Link>
        <button onClick={() => setShowCheckout(true)} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs flex items-center gap-3 shadow-lg hover:bg-slate-800 transition">
           CART ({cart.reduce((s,i)=>s+i.qty, 0)})
        </button>
      </nav>

      <header className="container mx-auto px-6 py-24 text-center">
         <div className="inline-block bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-emerald-100">
            Certified Vendor • 100% Guaranteed
         </div>
         <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none text-slate-900">{shop.name}</h1>
         <p className="text-slate-400 font-medium max-w-xl mx-auto">{shop.description}</p>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {products.map(p => (
          <div key={p.id} className="bg-white group rounded-[40px] overflow-hidden border border-slate-100 hover:border-blue-600/20 transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/5">
             <div className="h-72 bg-slate-50 flex items-center justify-center p-12 overflow-hidden relative">
                <img src={p.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-1000" alt="" />
                {p.price > 10000 && <div className="absolute top-4 left-4 bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Prime</div>}
             </div>
             <div className="p-8">
                <h3 className="font-bold text-lg mb-2 text-slate-800 line-clamp-2 leading-tight h-10">{p.name}</h3>
                <div className="flex items-baseline mb-8 text-slate-900">
                   <span className="text-xs font-black mr-0.5 opacity-40 uppercase">Rs</span>
                   <span className="text-3xl font-black tracking-tighter">{p.price.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => addToCart(p)} 
                  className="w-full bg-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                >
                  Add to Cart
                </button>
             </div>
          </div>
        ))}
      </main>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex justify-end">
           <div className="bg-white w-full max-w-xl h-full p-10 md:p-16 flex flex-col shadow-2xl overflow-y-auto animate-slide-in-right">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-3xl font-black uppercase tracking-tighter">Your Package</h2>
                 <button onClick={() => setShowCheckout(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition">✕</button>
              </div>
              
              <div className="flex-1 space-y-6">
                 {cart.map((item, idx) => (
                   <div key={idx} className="flex gap-4 items-center bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                      <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center">
                         <img src={item.p.imageUrl} className="max-h-full max-w-full object-contain" alt="" />
                      </div>
                      <div className="flex-1">
                         <p className="font-bold text-sm leading-tight text-slate-800">{item.p.name}</p>
                         <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase">x {item.qty}</p>
                            <p className="font-black text-slate-900">Rs. {(item.p.price * item.qty).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                 ))}
                 {cart.length === 0 && (
                   <div className="text-center py-20">
                      <p className="text-slate-400 font-bold italic">Cart is empty.</p>
                   </div>
                 )}
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100 space-y-4">
                 <div className="flex justify-between items-baseline mb-10">
                    <span className="font-black uppercase text-[10px] text-slate-400 tracking-widest">Total Pay</span>
                    <span className="text-4xl font-black tracking-tighter">Rs. {cart.reduce((s, i) => s + (i.p.price * i.qty), 0).toLocaleString()}</span>
                 </div>
                 <input placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                 <input placeholder="WhatsApp Number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                 <textarea placeholder="Global Delivery Address" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold h-24 outline-none focus:border-blue-500 transition" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                 <button onClick={submitOrder} disabled={cart.length === 0} className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black text-lg shadow-xl mt-8 active:scale-95 transition disabled:opacity-30">
                   Confirm Order
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
