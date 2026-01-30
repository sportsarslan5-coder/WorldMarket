
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Seller } from '../types.ts';

const { Link } = ReactRouterDOM as any;

const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s] = await Promise.all([api.getAllProducts(), api.fetchAllSellers()]);
        setProducts(p);
        setShops(s);
      } catch (e) { console.error(e); }
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 animate-pulse">Syncing Global Grid...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <nav className="h-24 sticky top-0 z-[100] border-b border-slate-50 bg-white/80 backdrop-blur-2xl flex items-center px-8 md:px-12">
        <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-3xl font-black tracking-tighter uppercase flex items-center gap-1 italic">
            AMZ<span className="text-blue-600">PRIME</span>
          </Link>
          <div className="hidden lg:flex gap-12 items-center">
             {['Marketplace', 'Manufacturers', 'ODM Service', 'Logistics'].map(link => (
               <button key={link} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition">{link}</button>
             ))}
          </div>
          <div className="flex gap-6 items-center">
            <Link to="/sell" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Become a Vendor</Link>
            <Link to="/admin" className="bg-slate-900 text-white px-10 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-2xl">HQ Portal</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="py-40 px-8 text-center bg-[#fafafa] relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up relative z-10">
          <span className="bg-white border border-slate-100 text-blue-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-sm">Pakistan's #1 ODM Global Marketplace</span>
          <h1 className="text-7xl md:text-[160px] font-black tracking-tighter leading-[0.8] uppercase italic">
            SOURCE <span className="text-blue-600">PRIME.</span>
          </h1>
          <p className="text-xl md:text-3xl text-slate-400 font-medium max-w-3xl mx-auto leading-tight italic">
             Connecting authorized manufacturers directly to the world. High-performance distribution at scale.
          </p>
          <div className="pt-12 flex flex-col sm:row gap-6 justify-center">
             <button onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior: 'smooth'})} className="bg-slate-900 text-white px-16 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-600 transition shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">Explore Grid</button>
          </div>
        </div>
      </header>

      {/* Filter Matrix */}
      <div className="sticky top-24 z-[90] bg-white border-b border-slate-50 py-8">
        <div className="max-w-[1600px] mx-auto px-8 md:px-12 flex gap-6 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-2xl shadow-blue-500/30' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main id="catalog" className="max-w-[1600px] mx-auto px-8 md:px-12 py-32">
        <div className="flex justify-between items-end mb-24">
           <div className="space-y-4">
             <h2 className="text-5xl font-black uppercase tracking-tighter italic">Live <span className="text-blue-600">Distribution</span></h2>
             <div className="flex items-center gap-4">
                <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                <p className="text-slate-300 font-bold uppercase text-[10px] tracking-[0.4em] italic">Real-time Persistence Node • {filteredProducts.length} Verified SKUs</p>
             </div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
          {filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} 
                to={shop ? `/${shop.slug}` : '#'}
                className="group flex flex-col animate-fade-in-up"
              >
                <div className="aspect-[4/5] bg-[#fcfcfc] rounded-[64px] flex items-center justify-center p-12 mb-10 overflow-hidden relative border border-slate-50 group-hover:bg-slate-50 transition duration-1000">
                   <img 
                     src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} 
                     alt={p.name} 
                     className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-1000 ease-out" 
                   />
                   <div className="absolute top-8 right-8 bg-white/80 backdrop-blur shadow-xl px-5 py-2.5 rounded-3xl text-[9px] font-black text-slate-400 uppercase tracking-widest border border-white">
                     Rs. {p.price.toLocaleString()}
                   </div>
                </div>
                <div className="px-4">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">{p.category}</p>
                   <h3 className="font-black text-3xl mb-6 italic tracking-tighter uppercase text-slate-900 leading-none group-hover:text-blue-600 transition">{p.name}</h3>
                   <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                      <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">VENDOR</p>
                        <p className="text-xs font-black italic text-slate-900 uppercase">{p.sellerName}</p>
                      </div>
                      <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-2xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                   </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-60 text-center">
             <p className="text-slate-200 font-black uppercase text-xl tracking-[0.8em] animate-pulse">Inventory Not Found</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-950 text-white pt-40 pb-20 px-8">
         <div className="max-w-[1600px] mx-auto space-y-32">
            <div className="flex flex-col md:flex-row justify-between items-start gap-24">
               <div className="space-y-8">
                  <h2 className="text-5xl font-black italic tracking-tighter uppercase">AMZ<span className="text-blue-600">PRIME</span></h2>
                  <p className="text-slate-500 max-w-md text-sm font-medium leading-relaxed uppercase tracking-widest">Architecting the future of Pakistan's digital manufacturing and global trade infrastructure.</p>
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-24">
                  {['Inventory', 'Nodes', 'Legal'].map(col => (
                    <div key={col} className="space-y-8">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">{col}</h4>
                       <ul className="text-xs font-bold space-y-6 uppercase tracking-[0.2em] text-slate-400">
                          <li className="hover:text-white cursor-pointer transition">Browse All</li>
                          <li className="hover:text-white cursor-pointer transition">PCI Compliance</li>
                          <li className="hover:text-white cursor-pointer transition">Terms of Node</li>
                       </ul>
                    </div>
                  ))}
               </div>
            </div>
            <div className="pt-20 border-t border-slate-900 flex flex-col md:row justify-between items-center gap-8">
               <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-700">© 2025 AMZ PRIME • GLOBAL PERSISTENCE ENABLED</p>
               <div className="flex gap-12 opacity-30">
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure Payments</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Global Payouts</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
