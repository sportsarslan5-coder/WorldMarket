
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black tracking-widest uppercase">
      Booting PK MART Grid...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-900 font-sans">
      <nav className="h-20 glass sticky top-0 z-50 border-b border-slate-100 flex items-center px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase">
            PK<span className="text-green-600">MART</span>
          </Link>
          <div className="flex gap-8 items-center">
            <Link to="/sell" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-green-600 transition">Become Vendor</Link>
            <Link to="/seller" className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition shadow-lg">Login</Link>
          </div>
        </div>
      </nav>

      <header className="py-32 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Official Pakistan Trade Grid</span>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] uppercase italic">
            Massive Scale. <br/>
            <span className="text-green-600">Direct Access.</span>
          </h1>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Access 500+ verified Pakistani products with real-time JazzCash settlement.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-center mb-12">
           <h2 className="text-3xl font-black uppercase tracking-tighter italic">Trending Now</h2>
           <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">{products.length} Products Found</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.slice(0, 40).map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} 
                to={shop ? `/shop/${shop.slug}` : '#'}
                className="group bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 p-8 flex flex-col"
              >
                <div className="aspect-square bg-slate-50 rounded-3xl flex items-center justify-center p-8 mb-6 relative">
                   <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-1000" />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-green-600 shadow-sm uppercase tracking-widest border border-green-50">
                     {p.views}M Views
                   </div>
                </div>
                <div className="flex-1">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">{p.category}</p>
                   <h3 className="font-black text-xl mb-4 truncate italic tracking-tighter uppercase">{p.name}</h3>
                   <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                      <p className="text-2xl font-black italic">Rs. {p.price.toLocaleString()}</p>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Buy Direct</span>
                   </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-20 py-10 text-center border-t border-slate-100">
           <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em]">Inventory Sync: 100% Secure Nodes</p>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-32 px-6">
         <div className="max-w-7xl mx-auto text-center space-y-8">
            <h2 className="text-6xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.5em]">The backbone of Pakistan's Digital Future</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
