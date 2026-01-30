
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
    const load = async () => {
      if (slug) {
        const s = await api.getSellerBySlug(slug);
        if (s) {
          setSeller(s);
          const p = await api.getProductsBySeller(s.id);
          setProducts(p);
        }
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !seller) return;
    
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

    alert("ORDER COMPLETED! Admin is being notified via WhatsApp.");
    setSelectedProduct(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">CONNECTING TO GRID...</div>;
  if (!seller) return <div className="h-screen flex items-center justify-center font-black text-red-500">404 | STORE DISCONNECTED</div>;

  return (
    <div className="min-h-screen bg-white">
      <nav className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">{seller.storeName}</h1>
        <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Authorized ODM</span>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none mb-4">New <span className="text-blue-600">Collection</span></h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Synchronized with Prime Global Node</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <div className="aspect-[3/4] rounded-[48px] bg-slate-50 mb-6 overflow-hidden relative">
                <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                   <span className="bg-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Quick View</span>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">{p.category}</p>
              <h3 className="text-xl font-black uppercase tracking-tight italic mb-2 leading-none">{p.name}</h3>
              <p className="text-2xl font-black">${p.price}</p>
              <button className="mt-6 w-full h-14 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition">Order Now</button>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[64px] max-w-4xl w-full p-12 flex flex-col md:flex-row gap-12 relative">
             <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 text-2xl font-black">✕</button>
             <div className="w-full md:w-1/2 aspect-square rounded-[40px] overflow-hidden bg-slate-50">
               <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" />
             </div>
             <div className="w-full md:w-1/2">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">{selectedProduct.name}</h3>
                <p className="text-3xl font-black text-blue-600 mb-8">${selectedProduct.price}</p>
                <form onSubmit={handleOrder} className="space-y-4">
                   <input required placeholder="Full Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none" 
                    onChange={e => setCustomer({...customer, name: e.target.value})} />
                   <input required placeholder="WhatsApp Number" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none" 
                    onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                   <textarea required placeholder="Delivery Address / City" className="w-full h-24 p-6 bg-slate-50 rounded-2xl font-bold border-none outline-none" 
                    onChange={e => setCustomer({...customer, address: e.target.value})} />
                   <button className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition">
                      Place My Order
                   </button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
