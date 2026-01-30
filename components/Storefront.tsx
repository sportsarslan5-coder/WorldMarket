
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Seller } from '../types.ts';

const Storefront: React.FC = () => {
  const { slug } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    whatsapp: '',
    email: ''
  });

  useEffect(() => {
    const loadStore = async () => {
      if (slug) {
        const foundSeller = await api.findSellerBySlug(slug);
        if (foundSeller) {
          setSeller(foundSeller);
          const sellerProds = await api.getProductsBySeller(foundSeller.id);
          setProducts(sellerProds);
        }
      }
      setLoading(false);
    };
    loadStore();
  }, [slug]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !seller) return;
    
    setLoading(true);
    await api.placeOrder({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productPrice: selectedProduct.price,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerSlug: seller.slug,
      customerName: customer.name,
      customerLocation: customer.address,
      customerWhatsapp: customer.whatsapp,
      customerEmail: customer.email
    });

    alert("SUCCESS! Admin is processing your order via WhatsApp.");
    setSelectedProduct(null);
    setLoading(false);
  };

  if (loading && !seller) return (
    <div className="h-screen flex items-center justify-center font-black bg-white uppercase tracking-[0.3em] animate-pulse">
      Connecting to Marketplace Node...
    </div>
  );
  
  if (!seller) return (
    <div className="h-screen flex flex-col items-center justify-center font-black bg-white p-6 text-center">
      <h1 className="text-8xl font-black italic tracking-tighter mb-4 text-red-500">OFFLINE</h1>
      <p className="uppercase tracking-widest text-slate-400">Merchant link not found or deactivated.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <nav className="p-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-40">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">{seller.storeName}</h1>
        <div className="flex items-center gap-4">
           <span className="hidden md:block text-[9px] font-black text-slate-300 uppercase tracking-widest">Global Payouts Enabled</span>
           <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto pt-24 pb-40">
        <header className="mb-24">
          <h2 className="text-7xl md:text-[140px] font-black uppercase tracking-tighter italic leading-[0.8] mb-10">THE <br/><span className="text-blue-600">COLLECTION.</span></h2>
          <div className="flex flex-wrap gap-4">
             <span className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Authorized Distributor</span>
             <span className="border border-slate-100 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">Verified by PK MART</span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer animate-fade-in-up" onClick={() => setSelectedProduct(p)}>
              <div className="aspect-[4/5] rounded-[64px] bg-[#f9f9f9] mb-10 overflow-hidden relative border border-slate-50 p-12">
                <img src={p.imageUrl} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-1000 ease-out" alt="" />
                <div className="absolute top-10 right-10 bg-white px-5 py-2.5 rounded-3xl text-[11px] font-black italic shadow-2xl">Rs. {p.price.toLocaleString()}</div>
              </div>
              <div className="px-4">
                 <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] mb-2">{p.category}</p>
                 <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none mb-6">{p.name}</h3>
                 <button className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition shadow-xl active:scale-95">Shop Now</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-2xl">
          <div className="bg-white rounded-[72px] max-w-5xl w-full p-12 md:p-20 flex flex-col md:flex-row gap-16 relative animate-scale-in">
             <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 text-3xl font-black hover:rotate-90 transition-transform">✕</button>
             
             <div className="w-full md:w-1/2 aspect-square rounded-[56px] overflow-hidden bg-[#f9f9f9] border border-slate-100 p-16">
               <img src={selectedProduct.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt="" />
             </div>
             
             <div className="w-full md:w-1/2 flex flex-col justify-center">
                <p className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mb-4">{selectedProduct.category}</p>
                <h3 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">{selectedProduct.name}</h3>
                <div className="flex items-center gap-6 mb-12">
                   <p className="text-4xl font-black text-slate-900 italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                   <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest border border-slate-100 px-4 py-2 rounded-xl">Variant: {selectedProduct.size}</span>
                </div>
                
                <form onSubmit={handleOrder} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required placeholder="Full Name" className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20" 
                        onChange={e => setCustomer({...customer, name: e.target.value})} />
                      <input required placeholder="WhatsApp Number" className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20" 
                        onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                   </div>
                   <textarea required placeholder="Delivery Location (Full Address / Landmarks)" className="w-full h-32 p-8 bg-slate-50 rounded-3xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20 resize-none" 
                    onChange={e => setCustomer({...customer, address: e.target.value})} />
                   
                   <div className="pt-8">
                      <button disabled={loading} className="w-full h-20 bg-blue-600 text-white rounded-[32px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-600/40 active:scale-95 transition-all flex items-center justify-center">
                         {loading ? 'SECURING ORDER...' : 'Place Order via WhatsApp'}
                      </button>
                      <p className="text-center mt-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">PCI-DSS Secure Settlement • Global Distribution</p>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
