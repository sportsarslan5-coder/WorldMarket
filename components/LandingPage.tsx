
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Shop, ShopStatus } from '../types.ts';
import { GlobeAltIcon } from './IconComponents.tsx';
import { api } from '../services/api.ts';

const LandingPage: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const syncNetwork = async () => {
    const [sh, p] = await Promise.all([api.fetchAllShops(), api.fetchGlobalProducts()]);
    setShops(sh);
    setProducts(p);
    setIsLoading(false);
  };

  useEffect(() => {
    syncNetwork();
    // Listen for storage events to update the grid instantly when someone else uploads a product
    window.addEventListener('storage', syncNetwork);
    return () => window.removeEventListener('storage', syncNetwork);
  }, []);

  const categories = ['All', 'Fashion', 'Electronics', 'Sports', 'Home', 'Art', 'Automotive', 'Logistics', 'Food Tech'];

  const filteredProducts = useMemo(() => {
    const activeShopIds = shops.filter(s => s.status === ShopStatus.ACTIVE).map(s => s.id);
    return products.filter(p => {
      const isVerified = activeShopIds.includes(p.sellerId);
      const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'All' || p.category === activeCategory;
      const isFeatured = p.id.startsWith('p-best-');
      return isVerified && matchesQuery && matchesCat && !isFeatured;
    });
  }, [searchQuery, activeCategory, products, shops]);

  const featuredItems = useMemo(() => {
    return products.filter(p => p.id.startsWith('p-best-')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Global Grid</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100">
      {/* Search-First Navigation */}
      <nav className="sticky top-0 z-[100] glass border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-slate-900 shrink-0">
             USA<span className="text-blue-600">SHOP</span>
          </Link>
          
          <div className="flex-1 max-w-xl relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search products, brands, and freight..." 
              className="w-full h-10 bg-slate-100 border-none rounded-full px-12 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-4 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div className="flex items-center gap-6">
             <Link to="/sell" className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition">Sell</Link>
             <Link to="/admin" className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition">Admin</Link>
             <Link to="/seller" className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-blue-600 transition">Seller Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Spotlight */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden bg-[#FBFBFD]">
         <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Live Globally: New Beez 22 Available</span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
                Better brands. <br/> 
                <span className="text-slate-400">Live on every mobile.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-lg font-medium leading-relaxed">
                Experience the world's most responsive multi-vendor platform. Upload once, broadcast to the entire USA grid instantly.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition transform hover:-translate-y-0.5 active:translate-y-0">Explore the Grid</button>
                <Link to="/sell" className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-full font-bold text-sm hover:bg-slate-50 transition">Launch Your Store</Link>
              </div>
            </div>
            <div className="relative hidden lg:block animate-fade-in" style={{animationDelay: '0.1s'}}>
              {/* Feature: New Beez 22 SpotLight */}
              <div className="aspect-[4/5] bg-slate-950 rounded-[40px] overflow-hidden shadow-2xl relative p-12 flex items-center justify-center">
                 <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800" className="w-full h-full object-contain mix-blend-screen opacity-90" alt="New Beez 22" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                 <div className="absolute bottom-12 left-12 text-white">
                    <p className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-2">Grid Exclusive</p>
                    <h2 className="text-4xl font-extrabold tracking-tight">NEW BEEZ 22</h2>
                    <p className="text-slate-400 font-medium text-sm mt-2 max-w-xs">Limited edition honeycomb athletics. Deployed live to 50 states.</p>
                 </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]">
                 <div className="flex gap-3 items-center mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Sync</span>
                 </div>
                 <p className="text-xs font-bold text-slate-900">Broadcast Success</p>
                 <p className="text-[10px] text-slate-500 font-medium mt-1">Item propagated to 1,240 mobile nodes.</p>
              </div>
            </div>
         </div>
      </section>

      {/* Featured Grid Horizontal Scroll */}
      <section className="py-24 bg-white border-y border-slate-50">
        <div className="max-w-[1440px] mx-auto px-6 mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Deployments</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Direct from verified American vendor nodes.</p>
          </div>
        </div>
        
        <div className="flex gap-6 overflow-x-auto px-6 pb-4 no-scrollbar snap-x snap-mandatory">
          {featuredItems.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} to={`/shop/${shop?.slug || 'error'}`}
                className="min-w-[320px] md:min-w-[420px] group snap-center"
              >
                <div className="aspect-[16/10] bg-[#F5F5F7] rounded-3xl overflow-hidden mb-6 relative">
                  <img src={p.imageUrl} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition duration-700 p-8" alt={p.name} />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 shadow-sm uppercase tracking-widest">Live Deployment</div>
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">{p.name}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">{shop?.name}</p>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900 tracking-tight">${p.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Main Grid Section */}
      <main className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex items-center gap-3 mb-16 overflow-x-auto pb-4 no-scrollbar">
           {categories.map(c => (
              <button 
                 key={c}
                 onClick={() => setActiveCategory(c)}
                 className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === c ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                 {c}
              </button>
           ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-40 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-bold text-sm">Waiting for new grid broadcasts...</p>
               <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="text-blue-600 font-bold text-xs mt-4 hover:underline">Reset Connection</button>
            </div>
          ) : filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} to={`/shop/${shop?.slug || 'error'}`}
                className="group flex flex-col animate-fade-in"
              >
                <div className="aspect-square bg-[#F5F5F7] rounded-3xl flex items-center justify-center p-8 overflow-hidden relative transition-all group-hover:shadow-xl group-hover:-translate-y-2">
                   <img src={p.imageUrl} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" alt={p.name} />
                   <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white/90 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                      </div>
                   </div>
                </div>
                <div className="mt-6 space-y-1 px-1">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category}</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">{shop?.name}</span>
                   </div>
                   <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition truncate">{p.name}</h3>
                   <div className="flex items-center justify-between pt-2">
                     <p className="text-xl font-extrabold text-slate-900 tracking-tight">${p.price.toLocaleString()}</p>
                     <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Mobile Ready</span>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="bg-[#FBFBFD] border-t border-slate-100 py-24 px-6 mt-20">
         <div className="max-w-[1440px] mx-auto text-center">
            <h2 className="text-3xl font-black italic tracking-tighter mb-8">USA<span className="text-blue-600">SHOP</span> GLOBAL GRID</h2>
            <div className="flex flex-wrap justify-center gap-12 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-16">
               <a href="#" className="hover:text-blue-600 transition">About Grid</a>
               <a href="#" className="hover:text-blue-600 transition">Vendor Protocol</a>
               <a href="#" className="hover:text-blue-600 transition">Logistics Hub</a>
               <a href="#" className="hover:text-blue-600 transition">Privacy</a>
            </div>
            <p className="text-xs text-slate-300 font-medium">© 2025 USA SHOP ENTERPRISE. ALL PACKETS ENCRYPTED. GLOBAL SYNC ACTIVE.</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
