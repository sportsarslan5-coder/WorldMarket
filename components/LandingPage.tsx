
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, Shop, ShopStatus } from '../types.ts';
import { DownloadIcon } from './IconComponents.tsx';

interface LandingPageProps {
  sellers: any[];
  shops: Shop[];
  products: Product[];
}

const LandingPage: React.FC<LandingPageProps> = ({ shops = [], products = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Fashion', 'Electronics', 'Sports', 'Home', 'Art'];

  const activeShopIds = useMemo(() => {
    return shops.filter(s => s.status === ShopStatus.ACTIVE).map(s => s.id);
  }, [shops]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const isFromActiveShop = activeShopIds.includes(p.shopId);
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return isFromActiveShop && matchesSearch && matchesCategory && p.published;
    });
  }, [searchQuery, activeCategory, products, activeShopIds]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Premium Global Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-10 w-full md:w-auto">
          <Link to="/" className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
            <span className="bg-slate-900 text-white px-2 py-0.5 rounded">W</span>
            <span>WORLD<span className="text-blue-600">SHOP</span></span>
          </Link>

          <div className="hidden md:flex gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/seller" className="hover:text-blue-600 transition">Seller Hub</Link>
            <Link to="/admin" className="hover:text-blue-600 transition">Console</Link>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl w-full flex bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <select 
            className="bg-transparent text-slate-500 px-4 text-[10px] font-black uppercase border-r border-slate-200 outline-none"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Search global suppliers and unique crafts..." 
            className="flex-1 bg-transparent p-3 outline-none text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
           <button 
             onClick={() => alert("To install: Tap 'Share' then 'Add to Home Screen' on iPhone, or click 'Install' in your browser menu on Android.")}
             className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition"
           >
              <DownloadIcon className="w-4 h-4" /> Install App
           </button>
           <div className="hidden md:block w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <header className="container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Universal Global Node: LIVE
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-6 max-w-5xl">
          THE WORLD'S <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 italic">CRAFTSMANSHIP</span> HUB
        </h1>
        <p className="text-lg font-medium text-slate-500 max-w-2xl leading-relaxed">
          From Sialkot's heritage to global innovation. Discover premium suppliers, authenticated products, and seamless logistics.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition transform hover:-translate-y-1">Start Exploring</button>
          <Link to="/seller" className="bg-white border border-slate-200 text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-600 transition">Sell Globally</Link>
        </div>
      </header>

      {/* Global Product Feed */}
      <main className="max-w-[1440px] mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-12">
           <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">Featured Collections</h2>
           <div className="h-px flex-1 bg-slate-200 mx-10"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.shopId);
            return (
              <div key={p.id} className="bg-white group rounded-[32px] overflow-hidden border border-slate-100 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2">
                <div className="h-64 overflow-hidden relative bg-slate-50 flex items-center justify-center p-10">
                  <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition duration-1000" alt={p.name} />
                  {p.price > 10000 && (
                    <div className="absolute top-4 left-4 priority-gradient text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Global Priority
                    </div>
                  )}
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                   <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.category}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Node</span>
                   </div>
                   <h3 className="font-bold text-lg mb-4 line-clamp-2 leading-tight text-slate-800 group-hover:text-blue-600 transition-colors">
                      {p.name}
                   </h3>
                   
                   <div className="mt-auto pt-6 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pricing</span>
                        <div className="flex items-baseline text-slate-900 font-black">
                           <span className="text-xs mr-0.5">Rs.</span>
                           <span className="text-2xl tracking-tighter">{p.price.toLocaleString()}</span>
                        </div>
                     </div>
                     <Link 
                       to={`/shop/${shop?.slug}`}
                       className="bg-slate-100 text-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition group-hover:shadow-lg active:scale-90"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                     </Link>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white p-32 rounded-[50px] text-center border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </div>
             <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">No global matches</h2>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-white p-20 mt-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <div className="text-3xl font-black italic tracking-tighter uppercase flex items-center justify-center gap-2">
            <span className="bg-white text-slate-900 px-2 rounded">W</span>
            WORLD-SHOP
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/seller" className="hover:text-white transition">Sell</Link>
            <Link to="/admin" className="hover:text-white transition">Consoles</Link>
            <button className="hover:text-white transition">Global Node</button>
          </div>
          <p className="opacity-30 text-[9px] font-bold uppercase tracking-[0.4em]">© 2024 WORLD-SHOP | Global Multi-Vendor Master Node</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
