
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
    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
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
      createdAt: new Date().toISOString()
    };

    await api.saveOrder(newOrder);
    
    // Trigger AI Notification for Admin
    if (onNotify) {
      await onNotify('NEW_ORDER', newOrder);
    }

    const itemsList = cart.map(i => `- ${i.p.name} (x${i.qty})`).join('\n');
    const msg = `*🚨 NEW ORDER: ${orderId}*\n*Store:* ${shop.name}\n\n*Items:*\n${itemsList}\n\n*Total:* Rs. ${total.toLocaleString()}\n\n*Logistics:* \n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}`;
    window.open(`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    
    alert("Order Deployed. Seller notified via WhatsApp.");
    setCart([]);
    setShowCheckout(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
       <div className="w-16 h-16 border-8 border-slate-200 border-t-[#febd69] rounded-full animate-spin"></div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
       <h1 className="text-6xl font-black italic uppercase text-slate-900 mb-6">Inactive Link</h1>
       <Link to="/" className="bg-[#131921] text-white px-12 py-5 rounded-[25px] font-black uppercase text-xs">Return</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-slate-900">
      <nav className="bg-[#131921] text-white p-6 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <Link to="/" className="text-2xl font-black italic tracking-tighter">PK-MART</Link>
        <button onClick={() => setShowCheckout(true)} className="bg-[#febd69] text-slate-900 px-8 py-3 rounded-2xl font-black flex items-center gap-3 shadow-lg">
           🛒 {cart.reduce((s,i)=>s+i.qty, 0)} Units
        </button>
      </nav>

      <header className="bg-white py-32 text-center border-b-2 border-slate-50">
         <h1 className="text-8xl font-black italic uppercase tracking-tighter mb-4">{shop.name}</h1>
         <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified PK-Vendor</span>
      </header>

      <main className="max-w-7xl mx-auto p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {products.map(p => (
          <div key={p.id} className="bg-white group rounded-[45px] overflow-hidden border-2 border-transparent hover:border-slate-100 transition-all duration-700">
             <div className="h-72 bg-slate-50 flex items-center justify-center p-12">
                <img src={p.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-1000" alt="" />
             </div>
             <div className="p-10 text-center">
                <h3 className="font-bold text-xl mb-4 text-slate-800 line-clamp-2">{p.name}</h3>
                <p className="text-4xl font-black tracking-tighter text-slate-900 mb-8">Rs. {p.price.toLocaleString()}</p>
                <button onClick={() => addToCart(p)} className="w-full bg-[#ffd814] py-5 rounded-[25px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95">Add to Basket</button>
             </div>
          </div>
        ))}
      </main>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex justify-end">
           <div className="bg-white w-full max-w-xl h-full p-10 md:p-16 flex flex-col shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center mb-16">
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter">Your Hub</h2>
                 <button onClick={() => setShowCheckout(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full">✕</button>
              </div>
              
              <div className="flex-1 space-y-8">
                 {cart.map((item, idx) => (
                   <div key={idx} className="flex gap-6 items-center bg-slate-50/50 p-6 rounded-[35px] border border-slate-100">
                      <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center">
                         <img src={item.p.imageUrl} className="max-h-full max-w-full object-contain" alt="" />
                      </div>
                      <div className="flex-1">
                         <p className="font-bold text-lg leading-tight">{item.p.name}</p>
                         <div className="flex justify-between items-end mt-2">
                            <p className="text-xs font-black text-slate-400 uppercase">Qty: {item.qty}</p>
                            <p className="font-black text-emerald-600">Rs. {(item.p.price * item.qty).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-16 pt-12 border-t-2 border-slate-50 space-y-4">
                 <div className="flex justify-between items-baseline mb-10">
                    <span className="font-black uppercase text-xs text-slate-400">Total</span>
                    <span className="text-5xl font-black tracking-tighter">Rs. {cart.reduce((s, i) => s + (i.p.price * i.qty), 0).toLocaleString()}</span>
                 </div>
                 <input placeholder="Name" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                 <input placeholder="WhatsApp (03XX...)" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                 <textarea placeholder="Address" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl font-bold h-24" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                 <button onClick={submitOrder} className="w-full bg-[#25D366] text-white py-6 rounded-3xl font-black text-xl shadow-2xl mt-8 active:scale-95 transition">
                   Deploy Order
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
