
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Shop } from '../types.ts';

const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([api.fetchGlobalProducts(), api.fetchAllShops()]);
      setProducts(p);
      setShops(s);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-900 font-sans">
      <nav className="h-16 glass sticky top-0 z-50 border-b border-slate-100 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-black italic tracking-tighter">
            PK<span className="text-green-600">MART</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link to="/sell" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-green-600 transition">Sell</Link>
            <Link to="/seller" className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-green-600 transition">Login</Link>
          </div>
        </div>
      </nav>

      <header className="py-20 px-6 text-center bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">Pakistan's Premium Export Grid</span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">Direct from the <br/><span className="text-green-600 italic">Source.</span></h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Shop authentic Sialkot sports gear, Karachi fashion, and local electronics directly from verified sellers.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold mb-10">Featured Local Gear</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} 
                to={shop ? `/shop/${shop.slug}` : '#'}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="aspect-square bg-slate-50 p-8 flex items-center justify-center relative">
                   <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" />
                   <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-full text-[9px] font-bold text-slate-400">Verified PK</div>
                </div>
                <div className="p-6">
                   <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">{p.category}</p>
                   <h3 className="font-bold text-base mb-1 truncate">{p.name}</h3>
                   <div className="flex justify-between items-center pt-2">
                      <p className="text-xl font-black">Rs. {p.price.toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-slate-400">{shop?.name}</span>
                   </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-20 px-6 text-center">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black italic mb-4">PK<span className="text-green-600">MART</span></h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Connecting Pakistan's Finest Vendors</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
