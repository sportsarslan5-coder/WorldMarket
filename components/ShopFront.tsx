
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const ShopFront: React.FC = () => {
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
    
    // Auto-generate WhatsApp Payload
    const itemsList = cart.map(i => `- ${i.p.name} (x${i.qty})`).join('\n');
    const msg = `*🚨 NEW PK-MART ORDER: ${orderId}*\n*Store:* ${shop.name}\n\n*Items:*\n${itemsList}\n\n*Total Settlement:* Rs. ${total.toLocaleString()}\n\n*Logistics:* \n👤 ${customer.name}\n📞 ${customer.phone}\n📍 ${customer.address}\n\n_Payment via Cash on Delivery_`;
    window.open(`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    
    alert("Order deployed to cloud. Seller has been notified via WhatsApp.");
    setCart([]);
    setShowCheckout(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
       <div className="w-16 h-16 border-8 border-slate-200 border-t-[#febd69] rounded-full animate-spin mb-6"></div>
       <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Resolving Store Slug...</p>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
       <div className="text-[120px] mb-10 select-none">📦</div>
       <h1 className="text-6xl font-black italic uppercase tracking-tighter text-slate-900 mb-6">Link Inactive</h1>
       <p className="text-slate-400 max-w-lg text-lg font-medium leading-relaxed">
         The shop you are looking for is either under maintenance or the vendor is awaiting admin activation. 
         Please contact the seller for a valid PK-MART link.
       </p>
       <Link to="/" className="mt-12 bg-[#131921] text-white px-12 py-5 rounded-[25px] font-black uppercase text-xs tracking-widest hover:scale-105 transition active:scale-95 shadow-2xl">Return to Hub</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-slate-900">
      <nav className="bg-[#131921] text-white p-6 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <Link to="/" className="text-2xl font-black italic tracking-tighter">PK-MART</Link>
        <div className="flex items-center gap-6">
           <p className="text-[10px] font-black uppercase text-slate-500 hidden md:block tracking-widest">Official Store of {shop.name}</p>
           <button onClick={() => setShowCheckout(true)} className="bg-[#febd69] text-slate-900 px-8 py-3 rounded-2xl font-black flex items-center gap-3 active:scale-95 transition shadow-lg">
             🛒 <span className="text-[11px] uppercase tracking-widest">{cart.reduce((s,i)=>s+i.qty, 0)} Units</span>
           </button>
        </div>
      </nav>

      <header className="bg-white py-32 text-center border-b-2 border-slate-50 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none text-[300px] font-black italic leading-none text-slate-200 -z-10 text-center">{shop.name.slice(0,3)}</div>
         <h1 className="text-8xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">{shop.name}</h1>
         <div className="flex items-center justify-center gap-4">
            <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified PK-Vendor</span>
            <span className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em]">{shop.category} Collection</span>
         </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {products.map(p => (
          <div key={p.id} className="bg-white group rounded-[45px] overflow-hidden border-2 border-transparent hover:border-slate-100 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700">
             <div className="h-72 bg-slate-50 flex items-center justify-center p-12 relative overflow-hidden">
                <img src={p.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-1000" alt="" />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-600 border border-slate-100 shadow-sm">In Stock</div>
             </div>
             <div className="p-10 text-center">
                <h3 className="font-bold text-xl leading-tight min-h-[3rem] mb-4 text-slate-800">{p.name}</h3>
                <div className="flex flex-col items-center gap-1 mb-8">
                   <span className="text-[10px] font-black uppercase text-slate-300">Market Price</span>
                   <span className="text-4xl font-black tracking-tighter text-slate-900">Rs. {p.price.toLocaleString()}</span>
                </div>
                <button onClick={() => addToCart(p)} className="w-full bg-[#ffd814] py-5 rounded-[25px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-amber-100 group-hover:shadow-none">Add to Basket</button>
             </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-40 text-center text-slate-300 font-black uppercase text-sm tracking-[0.4em]">Inventory currently offline.</div>
        )}
      </main>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex justify-end animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl h-full p-16 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.2)] animate-in slide-in-from-right duration-700 border-l border-slate-100">
              <div className="flex justify-between items-center mb-16">
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter">Your Hub</h2>
                 <button onClick={() => setShowCheckout(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition">✕</button>
              </div>
              
              <div className="flex-1 overflow-auto space-y-8 pr-4 custom-scrollbar">
                 {cart.map((item, idx) => (
                   <div key={idx} className="flex gap-6 items-center bg-slate-50/50 p-6 rounded-[35px] border border-slate-100">
                      <div className="w-20 h-20 bg-white rounded-2xl p-2 border border-slate-100 flex items-center justify-center">
                         <img src={item.p.imageUrl} className="max-h-full max-w-full object-contain" alt="" />
                      </div>
                      <div className="flex-1">
                         <p className="font-bold text-lg leading-tight text-slate-800">{item.p.name}</p>
                         <div className="flex justify-between items-end mt-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Qty: {item.qty}</p>
                            <p className="font-black text-emerald-600">Rs. {(item.p.price * item.qty).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                 ))}
                 {cart.length === 0 && <div className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-[0.3em]">Cart is empty</div>}
              </div>

              <div className="mt-16 pt-12 border-t-2 border-slate-50 space-y-4">
                 <div className="flex justify-between items-baseline mb-10">
                    <span className="font-black uppercase text-xs text-slate-400 tracking-widest">Total Settlement</span>
                    <span className="text-5xl font-black tracking-tighter text-slate-900">Rs. {cart.reduce((s, i) => s + (i.p.price * i.qty), 0).toLocaleString()}</span>
                 </div>
                 <div className="space-y-4">
                    <input placeholder="Full Name" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl outline-none font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                    <input placeholder="WhatsApp Number (03XX...)" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl outline-none font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                    <textarea placeholder="Complete Shipping Address" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl outline-none font-bold h-24" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                 </div>
                 <button disabled={cart.length === 0} onClick={submitOrder} className="w-full bg-[#25D366] text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-emerald-200 flex items-center justify-center gap-4 mt-8 hover:translate-y-[-2px] transition active:scale-95 disabled:opacity-50 disabled:translate-y-0">
                   Deploy Order (WhatsApp)
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
