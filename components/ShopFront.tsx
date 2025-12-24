
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!slug) return;
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

  const handleOrder = async () => {
    if (!selectedProduct || !shop || !orderForm.name || !orderForm.phone || !orderForm.address) {
      alert("Please fill all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newOrder: Order = {
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
      await api.saveOrder(newOrder);
      if (onNotify) await onNotify('NEW_ORDER', newOrder);

      // WhatsApp Relay for Customer
      const whatsappMsg = `*PK-MART GLOBAL ORDER*\n\n*Order ID:* ${orderId}\n*Store:* ${shop.name}\n*Product:* ${selectedProduct.name}\n*Variant:* ${orderForm.size || 'N/A'} / ${orderForm.color || 'N/A'}\n*Qty:* ${orderForm.quantity}\n*Total:* Rs. ${newOrder.totalAmount.toLocaleString()}\n\n*Customer:* ${orderForm.name}\n*Address:* ${orderForm.address}\n\n_System generated via PK-MART Node_`;
      
      // Open WhatsApp to seller
      window.open(`https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
      
      alert(`Order ${orderId} placed! Redirecting to WhatsApp for confirmation.`);
      setSelectedProduct(null);
    } catch (err) {
      alert("System sync failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Resolving Global Slug</p>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">404: Node Not Found</h1>
      <p className="text-slate-500 font-bold mb-8">The shop link you followed does not exist or has been de-registered.</p>
      <Link to="/" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Back to Market</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      <nav className="glass sticky top-0 z-[100] border-b border-slate-100 px-6 py-4 flex justify-between items-center">
         <Link to="/" className="text-lg font-black tracking-tighter group flex items-center gap-2">
            <div className="bg-slate-900 text-white px-2 py-0.5 rounded-lg group-hover:bg-blue-600 transition">PK</div>
            MART
         </Link>
         <div className="flex gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black uppercase tracking-widest">Verified Vendor</span>
            </div>
            <button className="bg-slate-50 text-slate-400 p-2.5 rounded-xl hover:text-blue-600 transition"><ShareIcon className="w-5 h-5" /></button>
         </div>
      </nav>

      <header className="bg-slate-900 text-white py-32 px-6 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <GlobeAltIcon className="w-[800px] h-[800px]" />
         </div>
         <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic leading-none mb-6">{shop.name}</h1>
            <p className="text-slate-400 font-bold text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">{shop.description}</p>
         </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group flex flex-col bg-white rounded-[48px] border border-slate-100 p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
               <div className="aspect-[4/5] bg-slate-50 rounded-[40px] flex items-center justify-center p-10 relative overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute bottom-4 left-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                     <button 
                        onClick={() => setSelectedProduct(p)}
                        className="w-full bg-white/90 backdrop-blur-md text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl"
                     >
                        Quick Purchase
                     </button>
                  </div>
               </div>
               <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="font-bold text-xl leading-tight h-14 overflow-hidden">{p.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                     <span className="text-xs font-black text-slate-300">Rs.</span>
                     <span className="text-3xl font-black tracking-tighter">{p.price.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </main>

      {/* Order Modal (Bottom Sheet Style) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
           <div className="bg-white w-full max-w-2xl my-auto p-8 md:p-16 rounded-[60px] relative animate-slide-up shadow-2xl">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black hover:bg-slate-200 transition">✕</button>
              
              <div className="flex gap-8 mb-12 items-center">
                 <div className="w-28 h-28 bg-slate-50 rounded-[32px] p-6 flex items-center justify-center">
                    <img src={selectedProduct.imageUrl} className="max-h-full object-contain" />
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{selectedProduct.category}</span>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mt-2">{selectedProduct.name}</h2>
                    <p className="text-2xl font-black text-slate-900">Rs. {selectedProduct.price.toLocaleString()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Select Size</label>
                       <div className="flex flex-wrap gap-2">
                          {selectedProduct.sizes.length > 0 ? selectedProduct.sizes.map(s => (
                             <button 
                                key={s} 
                                onClick={() => setOrderForm({...orderForm, size: s})}
                                className={`px-5 py-3 rounded-xl font-bold text-xs border-2 transition ${orderForm.size === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-300'}`}
                             >
                                {s}
                             </button>
                          )) : <span className="text-slate-400 font-bold text-xs italic">Standard Size</span>}
                       </div>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Quantity</label>
                       <div className="flex items-center gap-4">
                          <button onClick={() => setOrderForm(f => ({...f, quantity: Math.max(1, f.quantity - 1)}))} className="w-10 h-10 bg-slate-100 rounded-xl font-black">-</button>
                          <span className="font-black text-xl w-10 text-center">{orderForm.quantity}</span>
                          <button onClick={() => setOrderForm(f => ({...f, quantity: f.quantity + 1}))} className="w-10 h-10 bg-slate-100 rounded-xl font-black">+</button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <input placeholder="Your Full Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-blue-500/20" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                    <input placeholder="WhatsApp Number (Active)" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                    <textarea placeholder="Complete Delivery Address" className="w-full p-5 bg-slate-50 rounded-2xl font-bold h-32 outline-none" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} />
                    
                    <button 
                       disabled={isSubmitting}
                       onClick={handleOrder} 
                       className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-600 transition shadow-xl mt-4 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                       {isSubmitting ? 'Syncing Node...' : 'Confirm Global Order'}
                       {!isSubmitting && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 4.01C9.01 4.01 6.01 5.01 4.01 7.01C2.01 9.01 1.01 12.01 1.01 15.01C1.01 18.01 2.01 21.01 4.01 23.01H20.01C22.01 21.01 23.01 18.01 23.01 15.01C23.01 12.01 22.01 9.01 20.01 7.01C18.01 5.01 15.01 4.01 12.01 4.01Z"/></svg>}
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
