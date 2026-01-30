
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <nav className="h-20 glass sticky top-0 z-[100] border-b border-slate-100 flex items-center px-8">
        <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter uppercase flex items-center gap-1">
            AMZ<span className="text-blue-600">PRIME</span>
          </Link>
          <div className="hidden lg:flex gap-10 items-center">
             {['ODM Catalog', 'Manufacturers', 'Volume Pricing', 'Logistics'].map(link => (
               <button key={link} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition">{link}</button>
             ))}
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/sell" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">For Manufacturers</Link>
            <Link to="/seller" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl">Portal</Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="py-32 px-8 text-center bg-[#f8fafc] border-b border-slate-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up relative z-10">
          <span className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Exclusive USA ODM Marketplace</span>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic">
            Direct Source. <br/>
            <span className="text-blue-600">Prime Quality.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed italic">
             The premium distribution channel for US-based designers and original manufacturers.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
             <button onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior: 'smooth'})} className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 transition shadow-2xl">View Catalog</button>
             <Link to="/sell" className="bg-white border border-slate-200 text-slate-900 px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition">Register ODM</Link>
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <div className="sticky top-20 z-[90] bg-white/90 backdrop-blur-2xl border-b border-slate-100 py-6">
        <div className="max-w-[1400px] mx-auto px-8 flex gap-4 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main id="catalog" className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="flex justify-between items-end mb-16">
           <div className="space-y-2">
             <h2 className="text-4xl font-black uppercase tracking-tighter italic">Live <span className="text-blue-600">Distribution</span></h2>
             <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] italic">PCI-DSS Secure • {filteredProducts.length} Verified Listings</p>
             </div>
           </div>
           <div className="flex gap-2">
              <span className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">USD Market</span>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} 
                to={shop ? `/shop/${shop.slug}` : '#'}
                className="group product-card bg-white border border-slate-100 rounded-[48px] p-8 flex flex-col overflow-hidden"
              >
                <div className="aspect-[4/5] bg-[#fdfdfd] rounded-[36px] flex items-center justify-center p-8 mb-8 relative group-hover:bg-slate-50 transition duration-500">
                   <img 
                     src={p.imageUrl} 
                     alt={p.name} 
                     className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700 ease-out" 
                   />
                   <div className="absolute top-5 right-5 bg-white shadow-md px-4 py-2 rounded-2xl text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-50">
                     {p.views}M Interested
                   </div>
                </div>
                <div className="flex-1 space-y-2">
                   <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">{p.category}</p>
                   <h3 className="font-black text-xl mb-4 italic tracking-tighter uppercase text-slate-900 leading-[1.1]">{p.name}</h3>
                   <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                      <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">MSRP</p>
                        <p className="text-2xl font-black italic text-slate-900 leading-none">${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-xl hover:rotate-12">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                   </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <footer className="bg-slate-950 text-white pt-32 pb-16 px-8">
         <div className="max-w-[1400px] mx-auto space-y-24">
            <div className="flex flex-col md:flex-row justify-between items-start gap-16">
               <div className="space-y-6">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase">AMZ<span className="text-blue-600">PRIME</span></h2>
                  <p className="text-slate-500 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-wider">Defining the standard for US-based manufacturing and original design distribution.</p>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
                  {['Inventory', 'Compliance', 'About'].map(col => (
                    <div key={col} className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">{col}</h4>
                       <ul className="text-xs font-bold space-y-4 uppercase tracking-[0.1em] text-slate-400">
                          <li className="hover:text-white cursor-pointer transition">Quick Access</li>
                          <li className="hover:text-white cursor-pointer transition">PCI-DSS</li>
                          <li className="hover:text-white cursor-pointer transition">Partner Portal</li>
                       </ul>
                    </div>
                  ))}
               </div>
            </div>
            <div className="pt-16 border-t border-slate-900 flex justify-between items-center">
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">© 2025 AMZ PRIME GLOBAL INC.</p>
               <div className="flex gap-6 opacity-40">
                  <span className="text-[10px] font-black uppercase tracking-widest">Privacy Policy</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Terms of Service</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
