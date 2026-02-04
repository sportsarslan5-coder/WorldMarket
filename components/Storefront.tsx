
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
  const [customer, setCustomer] = useState({ name: '', whatsapp: '', address: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (slug) {
        // Sync with Cloud DB for global visibility
        const found = await api.findShowBySlug(slug);
        if (found) {
          setShow(found);
          const p = await api.getGlobalProducts();
          setProducts(p);
        }
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !show) return;
    await api.placeOrder({
      showSlug: show.slug,
      productName: selectedProduct.name,
      customerName: customer.name,
      customerWhatsapp: customer.whatsapp,
      customerAddress: customer.address
    });
    setSelectedProduct(null);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600 text-3xl italic">
      SYNCING WITH CLOUD NODE...
    </div>
  );

  if (!show) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase italic">Show Not Found</h1>
      <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">The requested link is either invalid or inactive.</p>
      <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="h-24 border-b flex justify-between items-center px-8 md:px-20 sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">{show.name} <span className="text-blue-600">SHOW</span></h1>
        <div className="hidden md:flex items-center gap-6">
           <div className="flex flex-col text-right">
              <span className="text-[9px] font-black uppercase text-slate-400">Fixed Commision</span>
              <span className="text-xs font-bold">5% Seller • 95% Admin</span>
           </div>
           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </nav>

      <header className="py-20 px-8 md:px-20 border-b border-slate-50 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Official Merchant Partner</p>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">{show.name}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic mt-6">Sports Grade Fabrics • Professional Manufacturing • Direct Supply</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 md:px-20 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <div className="aspect-[3/4] rounded-[48px] bg-slate-50 mb-8 flex items-center justify-center p-12 overflow-hidden transition-all hover:scale-[1.02]">
                <img src={p.imageUrl} className="max-h-full mix-blend-multiply transition duration-700" alt={p.name} />
                <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg italic">$35.00</div>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-4">{p.name}</h3>
              <button className="w-full h-14 bg-slate-900 text-white rounded-[20px] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition">
                Order Item
              </button>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-[56px] max-w-4xl w-full p-8 md:p-16 overflow-y-auto max-h-[90vh] relative animate-scale-in" onClick={e => e.stopPropagation()}>
             <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 text-3xl font-black text-slate-300 hover:text-slate-950">✕</button>
             
             <div className="flex flex-col md:flex-row gap-16">
                <div className="w-full md:w-1/2 aspect-square rounded-[40px] bg-slate-50 p-12 flex items-center justify-center">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                   <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4">{selectedProduct.name}</h3>
                   <p className="text-4xl font-black text-slate-900 mb-8 italic">$35.00</p>
                   
                   <form onSubmit={handleOrder} className="space-y-4">
                      <input required placeholder="Full Name" className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20" 
                        onChange={e => setCustomer({...customer, name: e.target.value})} />
                      <input required placeholder="WhatsApp Number" className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20" 
                        onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                      <textarea required placeholder="Shipping Address" className="w-full h-24 p-6 bg-slate-50 rounded-2xl font-bold border-none outline-none resize-none focus:ring-2 focus:ring-blue-600/20" 
                        onChange={e => setCustomer({...customer, address: e.target.value})} />
                      
                      <button className="w-full h-20 bg-blue-600 text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-slate-950 transition">
                        Order on WhatsApp
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
