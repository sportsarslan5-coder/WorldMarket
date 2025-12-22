
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, Seller, Shop, ShopStatus } from '../types.ts';

interface LandingPageProps {
  sellers: Seller[];
  shops: Shop[];
  products: Product[];
}

const LandingPage: React.FC<LandingPageProps> = ({ sellers = [], shops = [], products = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Fashion', 'Electronics', 'Sports', 'Home'];

  // Map active shop IDs for efficient filtering
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
    <div className="min-h-screen bg-[#f3f3f3] font-sans text-slate-900">
      <nav className="bg-[#131921] text-white p-4 flex flex-col md:flex-row items-center gap-6 sticky top-0 z-50 shadow-2xl">
        <Link to="/" className="text-2xl font-black text-white px-2 tracking-tighter">
          PK<span className="text-[#febd69]">-</span>MART
        </Link>
        
        <div className="flex-1 flex w-full shadow-lg rounded-md overflow-hidden">
          <select 
            className="bg-[#f3f3f3] text-slate-600 px-3 text-[10px] font-black uppercase border-r border-slate-300 outline-none"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Search Pakistan's best local deals..." 
            className="flex-1 p-3 outline-none text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-[#febd69] p-3 hover:bg-[#f3a847] transition px-6">
            <svg className="w-5 h-5 text-[#131921]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>

        <div className="flex gap-8 items-center text-[11px] font-black uppercase tracking-widest">
          <Link to="/seller" className="hover:text-[#febd69] transition">Seller Portal</Link>
          <Link to="/admin" className="hover:text-[#febd69] transition">Admin</Link>
        </div>
      </nav>

      <header className="relative h-[400px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover brightness-[0.4]" 
          alt="Hero" 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic uppercase">Pakistan's Global Mall</h1>
          <p className="text-lg font-bold max-w-2xl opacity-90 tracking-tight">Authenticated vendors. COD support. Fast logistics.</p>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-10 -mt-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(p => {
            const shop = shops.find(s => s.id === p.shopId);
            return (
              <div key={p.id} className="bg-white p-6 rounded-[30px] shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-500 border border-slate-100">
                <div className="h-56 mb-6 overflow-hidden relative rounded-2xl bg-slate-50 p-6">
                  <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition duration-1000" alt={p.name} />
                </div>
                <Link to={`/shop/${shop?.slug}`} className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest hover:underline">
                  {shop?.name} • Official Store
                </Link>
                <h3 className="font-bold text-lg mb-4 line-clamp-2 leading-tight text-slate-800">{p.name}</h3>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-baseline text-slate-900">
                    <span className="text-xs font-black mr-0.5">Rs.</span>
                    <span className="text-2xl font-black tracking-tighter">{p.price.toLocaleString()}</span>
                  </div>
                  <Link 
                    to={`/shop/${shop?.slug}`}
                    className="bg-[#febd69] text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#f7ca00] transition active:scale-95"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white p-32 rounded-[50px] text-center border-4 border-dashed border-slate-100">
             <div className="text-6xl mb-6">🏜️</div>
             <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">No matching SKUs found</h2>
          </div>
        )}
      </main>

      <footer className="bg-[#131921] text-white p-20 mt-20 text-center border-t-4 border-[#febd69]">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">PK-MART Terminal</h2>
          <p className="opacity-50 text-xs font-bold uppercase tracking-widest">Global Logistics & Multi-Vendor Hub</p>
          <div className="flex justify-center gap-10 text-[9px] font-black uppercase tracking-[0.3em] opacity-80 pt-10">
            <Link to="/seller" className="hover:text-[#febd69] transition">Vendor Login</Link>
            <Link to="/admin" className="hover:text-[#febd69] transition">System Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
