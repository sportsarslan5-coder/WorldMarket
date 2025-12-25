
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, Shop, ShopStatus } from '../types.ts';
import { DownloadIcon, GlobeAltIcon } from './IconComponents.tsx';
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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Syncing World_Grid</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-12">
          <Link to="/" className="text-3xl font-black italic tracking-tighter text-slate-900 group">
             PK<span className="text-blue-600 transition group-hover:text-slate-900">MART</span>
          </Link>
          
          <div className="hidden lg:flex flex-1 max-w-2xl bg-slate-100 border border-slate-200 rounded-3xl overflow-hidden focus-within:ring-2 ring-blue-500/20 transition-all">
            <input 
              type="text" placeholder="Search 10,000+ authentic SKUs..." 
              className="flex-1 px-8 py-4 bg-transparent outline-none font-bold text-slate-900"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
             <Link to="/sell" className="hidden sm:flex items-center px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-slate-900/10">Become a Seller</Link>
             <Link to="/admin" className="bg-slate-200 text-slate-900 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 transition">Command Center</Link>
          </div>
        </div>
      </nav>

      <section className="bg-slate-900 py-24 px-6 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <GlobeAltIcon className="w-full h-full text-white" />
         </div>
         <div className="max-w-[1400px] mx-auto relative z-10 text-center">
            <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">Global Dispatch Active</div>
            <h1 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.8] mb-10">THE WORLD <br/> IS YOUR <span className="text-blue-500">BAZAAR.</span></h1>
            <p className="text-slate-400 font-bold text-xl max-w-2xl mx-auto leading-relaxed">Direct connection to verified manufacturers and vendors across the country. Delivered globally.</p>
         </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-center gap-10 mb-16 overflow-x-auto pb-4 scrollbar-hide">
           {categories.map(c => (
              <button 
                 key={c}
                 onClick={() => setActiveCategory(c)}
                 className={`whitespace-nowrap text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === c ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-slate-400 hover:text-slate-900'}`}
              >
                 {c}
              </button>
           ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-40 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-black uppercase text-sm tracking-widest">No matching nodes found on grid</p>
            </div>
          ) : filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.sellerId);
            return (
              <Link 
                key={p.id} to={`/shop/${shop?.slug}`}
                className="group flex flex-col bg-white rounded-[60px] border border-slate-100 p-5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3"
              >
                <div className="aspect-square bg-slate-50 rounded-[45px] flex items-center justify-center p-12 overflow-hidden relative">
                   <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                   <div className="absolute top-8 right-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-black text-[9px] uppercase text-blue-600 border border-blue-100 shadow-sm">Verified Node</div>
                </div>
                <div className="p-8">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{p.category}</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase">{shop?.name}</span>
                   </div>
                   <h3 className="font-bold text-2xl mb-6 text-slate-900 group-hover:text-blue-600 transition line-clamp-1">{p.name}</h3>
                   <div className="flex justify-between items-end pt-6 border-t border-slate-50">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MSRP Price</p>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {p.price.toLocaleString()}</p>
                      </div>
                      <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:rotate-45 transition duration-500">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </div>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="bg-slate-950 text-white py-24 px-6 mt-20 text-center">
         <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-4xl font-black italic tracking-tighter">PK<span className="text-blue-600">MART</span>_GLOBAL</h2>
            <p className="text-slate-500 font-bold max-w-xl mx-auto uppercase text-xs tracking-widest leading-loose">The next generation multi-vendor node. Powered by the master command center for ultimate logistics efficiency.</p>
            <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
               <Link to="/sell" className="hover:text-white transition">Vendor Portal</Link>
               <Link to="/admin" className="hover:text-white transition">Command Center</Link>
               <a href="#" className="hover:text-white transition">Network Specs</a>
            </div>
            <p className="opacity-20 text-[9px] font-black uppercase tracking-[0.5em] pt-10">© 2025 PK-MART ENTERPRISE NODE. ALL SYSTEMS NOMINAL.</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
