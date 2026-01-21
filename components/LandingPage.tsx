
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Shop } from '../types.ts';

const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([api.fetchGlobalProducts(), api.fetchAllShops()]);
      setProducts(p);
      setShops(s);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="font-black tracking-widest uppercase text-xs animate-pulse">Syncing PK MART Global Catalog...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-900 font-sans">
      <nav className="h-20 glass sticky top-0 z-[100] border-b border-slate-100 flex items-center px-8">
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

      <header className="py-24 px-6 text-center bg-white border-b border-slate-50">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Official Pakistan Trade Grid</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">
            Massive Scale. <br/>
            <span className="text-green-600">Direct Access.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">Access the complete 500+ item verified catalog with direct vendor settlement.</p>
        </div>
      </header>

      {/* Category Filter */}
      <div className="sticky top-20 z-[90] bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 flex gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-12">
           <div>
             <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">The Inventory</h2>
             <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">Showing {filteredProducts.length} export-grade products</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} 
                to={shop ? `/shop/${shop.slug}` : '#'}
                className="group bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 p-6 flex flex-col"
              >
                <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center p-6 mb-4 relative overflow-hidden">
                   <img 
                     src={p.imageUrl} 
                     alt={p.name} 
                     loading="lazy"
                     className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" 
                   />
                   <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[7px] font-black text-green-600 shadow-sm uppercase tracking-widest border border-green-50">
                     {p.views}M Views
                   </div>
                </div>
                <div className="flex-1 space-y-1">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">{p.category}</p>
                   <h3 className="font-black text-sm mb-2 truncate italic tracking-tight uppercase text-slate-800">{p.name}</h3>
                   <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                      <p className="text-lg font-black italic text-slate-900">Rs. {p.price.toLocaleString()}</p>
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                   </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-20 py-16 text-center border-t border-slate-100">
           <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">Live Inventory Sync Active</p>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-32 px-6">
         <div className="max-w-7xl mx-auto text-center space-y-10">
            <h2 className="text-6xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></h2>
            <div className="flex flex-wrap justify-center gap-6 opacity-40">
               <span className="text-[9px] font-black uppercase tracking-widest">Global Logistics</span>
               <span className="text-[9px] font-black uppercase tracking-widest">Secured Node</span>
               <span className="text-[9px] font-black uppercase tracking-widest">Sialkot Exports</span>
               <span className="text-[9px] font-black uppercase tracking-widest">2Checkout Verified</span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] pt-10">Pakistan's Trade Infrastructure © 2025</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
