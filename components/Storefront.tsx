
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Show } from '../types.ts';

const Storefront: React.FC = () => {
  const { slug } = useParams();
  const [show, setShow] = useState<Show | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [customer, setCustomer] = useState({ 
    name: '', 
    whatsapp: '', 
    email: '', 
    address: '', 
    country: '', 
    city: '' 
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (slug) {
        // Attempt to resolve the shop from the global cloud database
        const found = await api.findShowBySlug(slug);
        if (found) {
          setShow(found);
          const p = await api.getGlobalProducts();
          setProducts(p);
          setLoading(false);
        } else if (retryCount < 3) {
          // Robust retry logic for mobile network jitter
          setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    load();
  }, [slug, retryCount]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !show) return;
    await api.placeOrder({
      showSlug: show.slug,
      productName: selectedProduct.name,
      productPrice: selectedProduct.price,
      customerName: customer.name,
      customerWhatsapp: customer.whatsapp,
      customerEmail: customer.email,
      customerAddress: customer.address,
      customerLocation: `${customer.country}, ${customer.city}`
    });
    setSelectedProduct(null);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-12 text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter">Connecting to Hub...</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Fetching Global Merchant Data</p>
    </div>
  );

  if (!show) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-10 text-slate-300">
         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase italic leading-none tracking-tighter">Shop <span className="text-red-500">Offline</span></h1>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-10 max-w-xs leading-relaxed">
        The global registry could not find "<span className="text-slate-900">{slug}</span>". 
        Please verify the link is correct.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => window.location.reload()} className="h-16 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200">Retry Connection</button>
        <Link to="/" className="h-16 bg-slate-100 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center">Return Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="h-24 border-b flex justify-between items-center px-8 md:px-20 sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">{show.name} <span className="text-blue-600">HUB</span></h1>
        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col text-right">
              <span className="text-[9px] font-black uppercase text-slate-400">Merchant Protocol</span>
              <span className="text-xs font-bold">5% Seller • 95% Admin</span>
           </div>
           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </nav>

      <header className="py-24 px-8 md:px-20 border-b bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.5em]">Exclusive Merchant Show</p>
            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-none">{show.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Basketball Uniforms • Guaranteed Quality • Delivery 7 Days</p>
          </div>
          <div className="w-64 h-64 bg-white p-8 rounded-[48px] shadow-2xl flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Global Price</span>
             <span className="text-6xl font-black italic text-blue-600">$35+</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Premium Grade</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-8 md:px-20 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <div className="aspect-[3/4] rounded-[56px] bg-slate-50 mb-8 flex items-center justify-center p-12 overflow-hidden transition-transform duration-500 hover:scale-[1.02] border border-transparent hover:border-blue-100">
                <img src={p.imageUrl} className="max-h-full mix-blend-multiply group-hover:scale-110 transition duration-700" alt={p.name} />
                <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg italic">${p.price.toFixed(2)}</div>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-4">{p.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-black italic">${p.price.toFixed(2)}</span>
                <button className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition">Order</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-[64px] max-w-5xl w-full p-8 md:p-16 overflow-y-auto max-h-[95vh] relative animate-scale-in" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 text-3xl font-black text-slate-300 hover:text-slate-950">✕</button>
             
             <div className="flex flex-col lg:flex-row gap-16">
                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="aspect-square rounded-[48px] bg-slate-50 p-16 flex items-center justify-center mb-8">
                    <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{selectedProduct.name}</h3>
                     <p className="text-5xl font-black text-blue-600 italic">${selectedProduct.price.toFixed(2)}</p>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">{selectedProduct.description}</p>
                     <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-block">Estimated Delivery: 7 Days</div>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 bg-slate-50 p-10 rounded-[48px] border border-slate-100">
                   <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Order Information</h4>
                   <form onSubmit={handleOrder} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Name</label>
                        <input required className="w-full h-14 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" 
                          onChange={e => setCustomer({...customer, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">WhatsApp Number</label>
                          <input required className="w-full h-14 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" 
                            onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email</label>
                          <input required type="email" className="w-full h-14 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" 
                            onChange={e => setCustomer({...customer, email: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Country</label>
                          <input required className="w-full h-14 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" 
                            onChange={e => setCustomer({...customer, country: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">City</label>
                          <input required className="w-full h-14 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" 
                            onChange={e => setCustomer({...customer, city: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Address</label>
                        <textarea required className="w-full h-24 p-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition resize-none" 
                          onChange={e => setCustomer({...customer, address: e.target.value})} />
                      </div>
                      
                      <button className="w-full h-20 bg-emerald-500 text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-950 transition-all transform active:scale-95 flex items-center justify-center gap-3">
                        Order Now on WhatsApp
                      </button>
                   </form>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
