
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';
import { ShareIcon, GlobeAltIcon } from './IconComponents.tsx';

const ShopFront: React.FC<{onNotify?: any}> = ({ onNotify }) => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', email: '', address: '', size: '', color: '', quantity: 1 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resolveNode = async () => {
      if (!slug) return;
      const found = await api.fetchShopBySlug(slug);
      if (found) {
        setShop(found);
        const p = await api.fetchProductsBySeller(found.id);
        setProducts(p);
      }
      setIsLoading(false);
    };
    resolveNode();
  }, [slug]);

  const placeGlobalOrder = async () => {
    if (!selectedProduct || !shop || !orderForm.name || !orderForm.phone || !orderForm.address) {
      alert("Missing Required Fields.");
      return;
    }
    
    setIsProcessing(true);
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const snapshot: Order = {
      id: orderId,
      shopId: shop.id,
      shopName: shop.name,
      customerName: orderForm.name,
      customerPhone: orderForm.phone,
      customerEmail: orderForm.email,
      customerAddress: orderForm.address,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImageUrl: selectedProduct.imageUrl,
        quantity: orderForm.quantity,
        price: selectedProduct.price,
        size: orderForm.size,
        color: orderForm.color
      }],
      totalAmount: selectedProduct.price * orderForm.quantity,
      paymentStatus: 'unpaid',
      paymentMethod: 'COD',
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    try {
      await api.saveOrder(snapshot);
      if (onNotify) await onNotify('NEW_ORDER', snapshot);

      // --- HIGH RELIABILITY WHATSAPP BRIDGE ---
      const msg = `*PK-MART GLOBAL ORDER*%0A%0A*Order:* ${orderId}%0A*Store:* ${shop.name}%0A*Product:* ${selectedProduct.name}%0A*Qty:* ${orderForm.quantity}%0A*Variant:* ${orderForm.size || 'N/A'}%0A*Total:* Rs. ${snapshot.totalAmount.toLocaleString()}%0A%0A*Customer:* ${orderForm.name}%0A*Address:* ${orderForm.address}%0A%0A_Powered by PK-MART Node_`;
      
      window.open(`https://wa.me/${shop.whatsappNumber}?text=${msg}`, '_blank');
      
      alert(`Success! Order ${orderId} synced. Opening WhatsApp for verification.`);
      setSelectedProduct(null);
    } catch (err) {
      alert("Grid Sync Error. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Locating Global Slug</p>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Node Not Found</h1>
      <p className="text-slate-500 font-bold mb-10 max-w-sm uppercase text-xs">The shop link you are accessing is either suspended or invalid.</p>
      <Link to="/" className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">Marketplace Hub</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="glass sticky top-0 z-[100] border-b border-slate-100 px-6 py-4 flex justify-between items-center">
         <Link to="/" className="text-xl font-black italic tracking-tighter group flex items-center gap-2">
            <div className="bg-slate-900 text-white w-8 h-8 rounded-lg group-hover:bg-blue-600 flex items-center justify-center transition">PK</div> MART
         </Link>
         <button className="bg-slate-50 text-slate-400 p-2.5 rounded-2xl hover:bg-slate-100 transition"><ShareIcon className="w-5 h-5" /></button>
      </nav>

      <header className="bg-slate-900 text-white py-32 px-6 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <GlobeAltIcon className="w-full h-full text-white" />
         </div>
         <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-emerald-500/20">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Verified Vendor
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">{shop.name}</h1>
            <p className="text-slate-400 font-bold text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">{shop.description}</p>
         </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group flex flex-col bg-white rounded-[50px] border border-slate-100 p-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
               <div className="aspect-[3/4] bg-slate-50 rounded-[40px] flex items-center justify-center p-12 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition duration-700" alt="p" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                     <button 
                        onClick={() => setSelectedProduct(p)}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition"
                     >
                        Purchase SKU
                     </button>
                  </div>
               </div>
               <div className="p-8">
                  <h3 className="font-bold text-xl mb-4 text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">{p.name}</h3>
                  <div className="flex justify-between items-baseline pt-4 border-t border-slate-50">
                     <span className="text-xs font-black text-slate-300 uppercase">Price</span>
                     <span className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {p.price.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </main>

      {/* Global Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
           <div className="bg-white w-full max-w-2xl my-auto p-10 md:p-16 rounded-[60px] relative animate-slide-up shadow-2xl">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black hover:bg-slate-200 transition">✕</button>
              
              <div className="flex gap-8 mb-12 items-center">
                 <div className="w-32 h-32 bg-slate-50 rounded-[40px] p-6 flex items-center justify-center border border-slate-100">
                    <img src={selectedProduct.imageUrl} className="max-h-full object-contain" alt="p" />
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{selectedProduct.category}</span>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mt-2">{selectedProduct.name}</h2>
                    <p className="text-3xl font-black text-slate-900 mt-1">Rs. {selectedProduct.price.toLocaleString()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Select Variant</label>
                       <div className="flex flex-wrap gap-2">
                          {selectedProduct.sizes.map(s => (
                             <button 
                                key={s} 
                                onClick={() => setOrderForm({...orderForm, size: s})}
                                className={`px-5 py-3 rounded-xl font-bold text-xs border-2 transition ${orderForm.size === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-slate-400 hover:border-slate-200'}`}
                             >
                                {s}
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Units</label>
                       <div className="flex items-center gap-6">
                          <button onClick={() => setOrderForm(f => ({...f, quantity: Math.max(1, f.quantity - 1)}))} className="w-12 h-12 bg-white rounded-2xl font-black shadow-sm">-</button>
                          <span className="font-black text-2xl text-slate-900 w-10 text-center">{orderForm.quantity}</span>
                          <button onClick={() => setOrderForm(f => ({...f, quantity: f.quantity + 1}))} className="w-12 h-12 bg-white rounded-2xl font-black shadow-sm">+</button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <input placeholder="Full Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                    <input placeholder="Active Phone / WhatsApp" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                    <textarea placeholder="Shipping Address Details" className="w-full p-5 bg-slate-50 rounded-2xl font-bold h-32 border border-transparent focus:border-blue-500 outline-none resize-none" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} />
                    
                    <button 
                       disabled={isProcessing}
                       onClick={placeGlobalOrder} 
                       className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black text-xl hover:bg-blue-600 transition shadow-xl mt-4 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                    >
                       {isProcessing ? 'Syncing Node...' : 'Sync Global Order'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
