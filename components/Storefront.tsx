
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
    country: 'Pakistan', 
    city: '' 
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (slug) {
        // Attempting to resolve the shop identity from the Global Cloud Hub
        const found = await api.findShowBySlug(slug);
        if (found) {
          setShow(found);
          const p = await api.getGlobalProducts();
          setProducts(p);
          setLoading(false);
        } else if (retryCount < 2) {
          // Retry to handle network jitter on mobile data connections
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
    alert("ORDER DATA TRANSMITTED. Redirecting to WhatsApp for finalization...");
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-12 text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter">Connecting to Global Hub...</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Synchronizing Merchant Records</p>
    </div>
  );

  if (!show) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10 text-center animate-scale-in">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[40px] flex items-center justify-center mb-10 shadow-2xl shadow-red-100">
         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase italic leading-none tracking-tighter">Shop <span className="text-red-500">Offline</span></h1>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-10 max-w-xs leading-relaxed">
        The global registry could not find "<span className="text-slate-900">{slug}</span>". 
        Please verify the link with the merchant.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => window.location.reload()} className="h-16 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition">Retry Cloud Sync</button>
        <Link to="/" className="h-16 bg-slate-100 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center">Return to Homepage</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="h-24 border-b flex justify-between items-center px-8 md:px-20 sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">{show.name} <span className="text-blue-600">HUB</span></h1>
        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col text-right">
              <span className="text-[9px] font-black uppercase text-slate-400">Direct Node</span>
              <span className="text-xs font-bold uppercase">Authorized Seller</span>
           </div>
           <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
        </div>
      </nav>

      <header className="py-24 px-8 md:px-20 border-b bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.5em]">Exclusive Manufacturing Partner</p>
            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-[0.85]">{show.name}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Premium Grade Uniforms • Factory Direct • 7-Day Global Shipping</p>
          </div>
          <div className="w-64 h-64 bg-white p-8 rounded-[48px] shadow-2xl flex flex-col items-center justify-center text-center group hover:scale-105 transition duration-500 border-2 border-slate-50">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Starting From</span>
             <span className="text-6xl font-black italic text-blue-600">$35</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Professional Quality</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-8 md:px-20 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <div className="aspect-[3/4] rounded-[56px] bg-slate-50 mb-8 flex items-center justify-center p-12 overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-transparent hover:border-blue-100 relative shadow-sm hover:shadow-xl">
                <img src={p.imageUrl} className="max-h-full mix-blend-multiply group-hover:scale-110 transition duration-1000" alt={p.name} />
                <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black shadow-lg italic border border-slate-100">${p.price.toFixed(2)}</div>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-4 group-hover:text-blue-600 transition">{p.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-black italic tracking-tighter">${p.price.toFixed(2)}</span>
                <button className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-[64px] max-w-5xl w-full p-8 md:p-16 overflow-y-auto max-h-[95vh] relative animate-scale-in" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full text-slate-300 hover:text-slate-950 hover:bg-slate-100 transition">✕</button>
             
             <div className="flex flex-col lg:flex-row gap-16">
                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="aspect-square rounded-[48px] bg-slate-50 p-16 flex items-center justify-center mb-8 border-2 border-slate-50 shadow-inner">
                    <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply drop-shadow-2xl" alt="" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{selectedProduct.name}</h3>
                     <p className="text-5xl font-black text-blue-600 italic tracking-tighter">${selectedProduct.price.toFixed(2)}</p>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">{selectedProduct.description}</p>
                     <div className="bg-emerald-50 text-emerald-600 p-5 rounded-3xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Global Air Delivery: 7 Days
                     </div>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 bg-slate-50 p-10 rounded-[48px] border border-slate-200 shadow-sm">
                   <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-8 border-b-2 border-slate-200 pb-4">Secure Order Form</h4>
                   <form onSubmit={handleOrder} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Full Customer Name</label>
                        <input required className="w-full h-16 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition shadow-sm" 
                          onChange={e => setCustomer({...customer, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">WhatsApp ID</label>
                          <input required placeholder="+92..." className="w-full h-16 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition shadow-sm" 
                            onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Email Node</label>
                          <input required type="email" className="w-full h-16 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition shadow-sm" 
                            onChange={e => setCustomer({...customer, email: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Region</label>
                          <input required placeholder="Pakistan" className="w-full h-16 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition shadow-sm" 
                            onChange={e => setCustomer({...customer, country: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">City</label>
                          <input required className="w-full h-16 px-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition shadow-sm" 
                            onChange={e => setCustomer({...customer, city: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Detailed Shipping Address</label>
                        <textarea required className="w-full h-24 p-6 bg-white rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition resize-none shadow-sm" 
                          onChange={e => setCustomer({...customer, address: e.target.value})} />
                      </div>
                      
                      <button className="w-full h-20 bg-emerald-600 text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-950 transition-all transform active:scale-95 flex items-center justify-center gap-3 mt-4">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.667.15-.198.3-.763.971-.935 1.17-.172.2-.344.225-.645.075-.3-.15-1.266-.467-2.413-1.488-.894-.798-1.497-1.783-1.673-2.083-.176-.3-.019-.462.13-.611.135-.133.301-.35.452-.524.15-.175.201-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.667-1.608-.914-2.204-.241-.58-.487-.5-.667-.51-.173-.009-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.3-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.06L0 24l6.117-1.605a11.803 11.803 0 005.925 1.585h.005c6.635 0 12.032-5.396 12.035-12.031a11.77 11.77 0 00-3.526-8.482z"/></svg>
                        Finalize on WhatsApp
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
