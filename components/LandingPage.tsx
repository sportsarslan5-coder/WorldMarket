
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, Shop, ShopStatus } from '../types.ts';
import { DownloadIcon, GlobeAltIcon } from './IconComponents.tsx';

interface LandingPageProps {
  sellers: any[];
  shops: Shop[];
  products: Product[];
}

const LandingPage: React.FC<LandingPageProps> = ({ shops = [], products = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Fashion', 'Electronics', 'Sports', 'Home', 'Art'];

  const filteredProducts = useMemo(() => {
    // Only show products from active/approved shops
    const activeShopIds = shops
      .filter(s => s.status === ShopStatus.ACTIVE)
      .map(s => s.id);

    return products.filter(p => {
      const isFromActiveShop = activeShopIds.includes(p.shopId);
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return isFromActiveShop && matchesSearch && matchesCategory && p.published;
    });
  }, [searchQuery, activeCategory, products, shops]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      {/* Global Header */}
      <nav className="glass sticky top-0 z-[100] border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 transition">PK</div>
            <span className="text-xl font-black tracking-tighter">MART<span className="text-blue-600">.</span></span>
          </Link>
          
          <div className="hidden lg:flex flex-1 max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <input 
              type="text" 
              placeholder="Search 10,000+ authentic Pakistani products..." 
              className="flex-1 px-6 py-3 outline-none text-sm font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="px-6 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition">Search</button>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/seller" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition">Sell on PK-MART</Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <button className="bg-slate-100 text-slate-900 p-3 rounded-xl hover:bg-slate-200 transition">
              <DownloadIcon className="w-5 h-5" />
            </button>
            <Link to="/admin" className="bg-slate-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition">Admin Console</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 px-6">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <GlobeAltIcon className="w-full h-full text-white" />
        </div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-blue-500/20">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Direct From Pakistan's Best Vendors
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8 max-w-4xl">
            EMPOWERING THE <br/> <span className="text-blue-500 italic">CRAFTSMEN</span> OF PAKISTAN
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed mb-12">
            The first truly global multi-vendor platform for Pakistani businesses. From local bazaars to global doorsteps.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:-translate-y-1 transition">Start Shopping</button>
            <Link to="/seller" className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition backdrop-blur-md">Open Your Shop</Link>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <div className="sticky top-[80px] z-40 bg-white border-b border-slate-200 py-4 overflow-x-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-8">
          {categories.map(c => (
            <button 
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === c ? 'text-blue-600 underline underline-offset-8' : 'text-slate-400 hover:text-slate-900'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.shopId);
            return (
              <Link 
                key={p.id} 
                to={`/shop/${shop?.slug}`}
                className="group bg-white rounded-[40px] border border-slate-200 p-4 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
              >
                <div className="aspect-square bg-slate-50 rounded-[32px] overflow-hidden flex items-center justify-center p-8 group-hover:p-4 transition-all duration-700">
                  <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.category}</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase">Qty: {p.stock}</span>
                   </div>
                   <h3 className="font-bold text-lg mb-6 line-clamp-2 leading-tight group-hover:text-blue-600 transition">
                      {p.name}
                   </h3>
                   
                   <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</span>
                        <div className="flex items-baseline text-slate-900 font-black">
                           <span className="text-[10px] mr-1 opacity-50">Rs.</span>
                           <span className="text-2xl tracking-tighter">{p.price.toLocaleString()}</span>
                        </div>
                     </div>
                     <div className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                     </div>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[60px] border-2 border-dashed border-slate-200">
             <h2 className="text-2xl font-black text-slate-300 uppercase tracking-[0.3em]">No Global Nodes Found</h2>
             <p className="text-slate-400 mt-4 font-bold">Try changing categories or search terms.</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-white p-20 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-3xl font-black italic tracking-tighter uppercase flex items-center justify-center gap-2">
            <span className="bg-blue-600 text-white px-2 rounded-lg">PK</span>
            MART-GLOBAL
          </div>
          <p className="text-slate-500 font-bold max-w-md mx-auto">Connecting Pakistan's heritage with the world's convenience. Verified quality, global reach.</p>
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link to="/seller" className="hover:text-white transition">Vendor Portal</Link>
            <Link to="/admin" className="hover:text-white transition">Admin Grid</Link>
            <a href="https://ai.google.dev/gemini-api/docs/billing" className="hover:text-white transition">Network Fees</a>
          </div>
          <p className="opacity-20 text-[9px] font-bold uppercase tracking-[0.4em] pt-10">© 2025 PK-MART ENTERPRISE NODE</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
