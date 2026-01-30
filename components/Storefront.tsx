
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

  const [customer, setCustomer] = useState({ name: '', address: '', whatsapp: '', email: '' });

  useEffect(() => {
    const loadStore = async () => {
      if (slug) {
        const found = await api.findSellerBySlug(slug);
        if (found) {
          setSeller(found);
          const prods = await api.getProductsBySeller(found.id);
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
      sellerId: seller.id,
      sellerName: seller.name,
      sellerSlug: seller.slug,
      customerName: customer.name,
      customerLocation: customer.address,
      customerWhatsapp: customer.whatsapp,
      customerEmail: customer.email
    });
    alert("ORDER PLACED! Opening WhatsApp for Admin Verification.");
    setSelectedProduct(null);
    setLoading(false);
  };

  if (loading && !seller) return <div className="h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-[0.3em]">Syncing Cloud...</div>;
  if (!seller) return <div className="h-screen flex items-center justify-center font-black text-red-500 uppercase tracking-widest text-3xl">404 | Store Link Not Found</div>;

  return (
    <div className="min-h-screen bg-white">
      <nav className="p-8 border-b flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-40">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{seller.storeName}</h1>
        <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto py-20">
        <header className="mb-20">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.85] mb-6">Our <span className="text-blue-600">Inventory.</span></h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Direct from Factory Floor • Authorized Distributor</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <div className="aspect-[4/5] rounded-[48px] bg-slate-50 mb-8 overflow-hidden relative p-12">
                <img src={p.imageUrl} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-1000" />
                <div className="absolute top-8 right-8 bg-white px-5 py-2.5 rounded-3xl text-[11px] font-black italic shadow-2xl">Rs. {p.price.toLocaleString()}</div>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">{p.name}</h3>
              <button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition shadow-xl active:scale-95">Order Now</button>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-2xl">
          <div className="bg-white rounded-[64px] max-w-5xl w-full p-12 md:p-16 flex flex-col md:flex-row gap-16 relative">
             <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 text-3xl font-black">✕</button>
             <div className="w-full md:w-1/2 aspect-square rounded-[40px] overflow-hidden bg-slate-50 p-12">
               <img src={selectedProduct.imageUrl} className="w-full h-full object-contain mix-blend-multiply" />
             </div>
             <div className="w-full md:w-1/2 flex flex-col justify-center">
                <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">{selectedProduct.name}</h3>
                <p className="text-3xl font-black text-slate-900 mb-10 italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                <form onSubmit={handleOrder} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <input required placeholder="Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none" onChange={e => setCustomer({...customer, name: e.target.value})} />
                      <input required placeholder="WhatsApp" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none" onChange={e => setCustomer({...customer, whatsapp: e.target.value})} />
                   </div>
                   <textarea required placeholder="Delivery Address / City" className="w-full h-24 p-6 bg-slate-50 rounded-2xl font-bold border-none outline-none resize-none" onChange={e => setCustomer({...customer, address: e.target.value})} />
                   <button className="w-full h-20 bg-blue-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition">Confirm Order</button>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
