
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    email: '', 
    location: '' 
  });

  useEffect(() => {
    const loadStore = async () => {
      if (slug) {
        const found = await api.findSellerBySlug(slug);
        if (found) {
          setSeller(found);
          const prods = await api.getAllProducts();
          setProducts(prods);
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
      sellerSlug: seller.slug,
      customerName: customer.name,
      customerLocation: `${customer.location}, ${customer.address}`,
      customerWhatsapp: customer.whatsapp,
      customerEmail: customer.email
    });
    setSelectedProduct(null);
    setLoading(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#25D366]">AUTHENTICATING NODE...</div>;
  if (!seller) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-8xl font-black text-slate-100 mb-4">404</h1>
      <p className="text-sm font-bold uppercase tracking-[0.4em] text-slate-400">Merchant Link Expired or Not Found</p>
      <Link to="/" className="mt-8 text-[#25D366] font-black uppercase text-xs tracking-widest hover:underline">Return to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="p-6 border-b flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">{seller.storeName}</h1>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-[#25D366] rounded-full"></span>
           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Live Inventory</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-20 space-y-4">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.85]">Patch <br/> <span className="text-[#25D366]">Gallery.</span></h2>
          <div className="flex items-center gap-6">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Direct Factory Access • 7-Day Express Delivery</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer product-card" onClick={() => setSelectedProduct(p)}>
              <div className="aspect-square rounded-[40px] bg-slate-50 mb-6 flex items-center justify-center p-10 border border-slate-50 relative">
                <img src={p.imageUrl} className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500" />
                <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-xl text-[10px] font-black shadow-sm italic">Rs. {p.price.toLocaleString()}</div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4">{p.name}</h3>
              <button className="w-full h-14 bg-[#25D366] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#128C7E] transition shadow-lg flex items-center justify-center gap-2">
                Order via WhatsApp
              </button>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white rounded-[48px] max-w-4xl w-full p-8 md:p-12 overflow-y-auto max-h-[90vh] relative animate-slide-in">
             <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 text-2xl font-black">✕</button>
             
             <div className="flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-1/2 aspect-square rounded-[32px] bg-slate-50 p-10 flex items-center justify-center">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" />
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                   <span className="text-[#25D366] font-black text-[10px] uppercase tracking-widest mb-2">Delivery Time: 7 Days</span>
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">{selectedProduct.name}</h3>
                   <p className="text-3xl font-black text-slate-900 mb-8 italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                   
                   <form onSubmit={handleOrder} className="space-y-4">
                      <input required placeholder="Full Name" className="w-full h-14 px-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" 
                        onChange={e => setCustomer({...customer, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="WhatsApp Number" className="w-full h-14 px-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" 
                          onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                        <input required type="email" placeholder="Email Address" className="w-full h-14 px-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" 
                          onChange={e => setCustomer({...customer, email: e.target.value})} />
                      </div>
                      <input required placeholder="Country / City" className="w-full h-14 px-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" 
                        onChange={e => setCustomer({...customer, location: e.target.value})} />
                      <textarea required placeholder="Full Shipping Address" className="w-full h-24 p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none resize-none focus:ring-2 focus:ring-[#25D366]/20" 
                        onChange={e => setCustomer({...customer, address: e.target.value})} />
                      
                      <button disabled={loading} className="w-full h-18 bg-[#25D366] text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#128C7E] transition disabled:opacity-50">
                        {loading ? 'Processing...' : 'Place Order on WhatsApp'}
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
