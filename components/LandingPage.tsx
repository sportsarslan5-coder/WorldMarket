
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

  useEffect(() => {
    const syncNetwork = async () => {
      const [sh, p] = await Promise.all([api.fetchAllShops(), api.fetchGlobalProducts()]);
      setShops(sh);
      setProducts(p);
      setIsLoading(false);
    };
    syncNetwork();
  }, []);

  const categories = ['All', 'Fashion', 'Electronics', 'Sports', 'Home', 'Art'];

  const filteredProducts = useMemo(() => {
    const activeShopIds = shops.filter(s => s.status === ShopStatus.ACTIVE).map(s => s.id);
    return products.filter(p => {
      const isVerified = activeShopIds.includes(p.sellerId);
      const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'All' || p.category === activeCategory;
      return isVerified && matchesQuery && matchesCat;
    });
  }, [searchQuery, activeCategory, products, shops]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Syncing Master Node</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-6 py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-12">
          <Link to="/" className="text-3xl font-black italic tracking-tighter text-slate-900 group">
             PK<span className="text-blue-600 transition group-hover:text-slate-900">MART</span>
          </Link>
          
          <div className="hidden lg:flex flex-1 max-w-2xl bg-slate-100 border border-slate-200 rounded-[25px] overflow-hidden focus-within:ring-4 ring-blue-500/10 transition-all">
            <input 
              type="text" placeholder="Search 500+ verified Pakistani vendors..." 
              className="flex-1 px-8 py-4 bg-transparent outline-none font-bold text-slate-900 text-sm"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
             <Link to="/sell" className="hidden sm:flex items-center px-10 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-2xl">Start Selling</Link>
             <Link to="/admin" className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition">Admin</Link>
          </div>
        </div>
      </nav>

      <section className="bg-slate-950 py-32 px-6 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none scale-150 rotate-12">
            <GlobeAltIcon className="w-full h-full text-blue-500" />
         </div>
         <div className="max-w-[1400px] mx-auto relative z-10 text-center">
            <div className="inline-block bg-blue-600 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 shadow-xl">PK-MART GLOBAL GRID</div>
            <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.8] mb-12">THE SMART <br/> <span className="text-blue-500">BAZAAR.</span></h1>
            <p className="text-slate-400 font-bold text-xl max-w-2xl mx-auto leading-relaxed">Direct-to-WhatsApp delivery from Pakistan's most trusted manufacturers. Keep 100% control, we handle the grid.</p>
         </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex items-center gap-12 mb-20 overflow-x-auto pb-4 no-scrollbar">
           {categories.map(c => (
              <button 
                 key={c}
                 onClick={() => setActiveCategory(c)}
                 className={`whitespace-nowrap text-[12px] font-black uppercase tracking-widest transition-all ${activeCategory === c ? 'text-blue-600 border-b-4 border-blue-600 pb-4' : 'text-slate-400 hover:text-slate-900'}`}
              >
                 {c}
              </button>
           ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-60 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-200">
               <p className="text-slate-400 font-black uppercase text-sm tracking-widest">No nodes found on this frequency</p>
               <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="text-blue-600 font-black underline uppercase text-xs mt-4">Reset Grid Connection</button>
            </div>
          ) : filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} to={`/shop/${shop?.slug || 'error'}`}
                className="group flex flex-col bg-white rounded-[60px] border border-slate-100 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-4"
              >
                <div className="aspect-square bg-[#f8fafc] rounded-[45px] flex items-center justify-center p-12 overflow-hidden relative">
                   <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                   <div className="absolute top-8 right-8 bg-white/90 backdrop-blur px-5 py-2 rounded-full font-black text-[9px] uppercase text-blue-600 border border-blue-100 shadow-sm">Verified Node</div>
                </div>
                <div className="p-8">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{p.category}</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase">{shop?.name}</span>
                   </div>
                   <h3 className="font-bold text-3xl mb-10 text-slate-900 group-hover:text-blue-600 transition line-clamp-1">{p.name}</h3>
                   <div className="flex justify-between items-end pt-10 border-t border-slate-50">
                      <div>
                         <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">MSRP Grid Price</p>
                         <p className="text-4xl font-black text-slate-900 tracking-tighter italic">Rs. {p.price.toLocaleString()}</p>
                      </div>
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:rotate-12 transition duration-500 shadow-xl">
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </div>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="bg-slate-950 text-white py-32 px-6 text-center">
         <div className="max-w-[1400px] mx-auto space-y-16">
            <h2 className="text-5xl font-black italic tracking-tighter">PK<span className="text-blue-600">MART</span>_GRID</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto border-y border-white/5 py-16">
               <div>
                  <h4 className="text-blue-500 font-black text-4xl mb-2 tracking-tighter">10k+</h4>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active SKU Nodes</p>
               </div>
               <div>
                  <h4 className="text-white font-black text-4xl mb-2 tracking-tighter">14</h4>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cities Served</p>
               </div>
               <div>
                  <h4 className="text-emerald-500 font-black text-4xl mb-2 tracking-tighter">5%</h4>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Fixed Fee Protocol</p>
               </div>
            </div>
            <p className="opacity-10 text-[9px] font-black uppercase tracking-[0.8em] pt-10">© 2025 PK-MART GLOBAL ENTERPRISE SYSTEM. ALL SYSTEMS SECURED.</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
