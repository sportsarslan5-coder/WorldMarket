
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, Seller } from '../types.ts';

interface LandingPageProps {
  sellers: Seller[];
  products: Product[];
}

const LandingPage: React.FC<LandingPageProps> = ({ sellers = [], products = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Fashion', 'Sports', 'Home'];

  // Critical fix: Only show products from ACTIVE sellers
  const activeSellersIds = useMemo(() => {
    return sellers.filter(s => s.status === 'active').map(s => s.id);
  }, [sellers]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const isFromActiveSeller = activeSellersIds.includes(p.sellerId) || activeSellersIds.includes(p.shopId);
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return isFromActiveSeller && matchesSearch && matchesCategory && p.published;
    });
  }, [searchQuery, activeCategory, products, activeSellersIds]);

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

      <header className="relative h-[450px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover brightness-[0.35]" 
          alt="Hero" 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in duration-1000">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 drop-shadow-2xl italic uppercase">Local. Trusted. Fast.</h1>
          <p className="text-xl font-bold max-w-2xl opacity-80 drop-shadow-md tracking-tight">Buy directly from authenticated Pakistani vendors with Seller Protex protection.</p>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-6 -mt-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(p => {
            const seller = sellers.find(s => s.id === p.sellerId || s.id === p.shopId);
            return (
              <div key={p.id} className="bg-white p-6 rounded-xl shadow-lg flex flex-col group hover:shadow-2xl transition-all duration-300 border border-slate-100">
                <div className="h-60 mb-6 overflow-hidden relative rounded-lg bg-slate-50 p-4">
                  <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[7px] font-black uppercase px-2 py-1 rounded shadow-sm">Active Now</div>
                </div>
                <Link to={`/shop/${seller?.shopSlug}`} className="text-[10px] font-black text-blue-600 hover:text-orange-600 mb-2 uppercase tracking-widest border-b border-transparent hover:border-orange-600 inline-block transition">
                  {seller?.shopName} • Visit Official Store
                </Link>
                <h3 className="font-bold text-lg mb-4 line-clamp-2 leading-tight tracking-tight text-slate-800">{p.name}</h3>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-baseline text-slate-900">
                    <span className="text-xs font-black mr-0.5">Rs.</span>
                    <span className="text-2xl font-black tracking-tighter">{p.price.toLocaleString()}</span>
                  </div>
                  <Link 
                    to={`/shop/${seller?.shopSlug}`}
                    className="bg-[#ffd814] text-[#131921] px-5 py-2.5 rounded-full text-[10px] font-black shadow-md hover:bg-[#f7ca00] transition active:scale-95"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white p-20 rounded-3xl text-center shadow-xl border">
             <div className="text-6xl mb-4">📭</div>
             <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No listings found</h2>
             <p className="text-slate-400 font-bold mt-2">Try adjusting your search or category.</p>
          </div>
        )}
      </main>

      <footer className="bg-[#232f3e] text-white p-20 mt-20 text-center border-t-8 border-[#febd69]">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl font-black tracking-tighter">PK-MART PAKISTAN</h2>
          <p className="opacity-60 text-sm font-medium leading-relaxed">The premier multi-vendor marketplace solution for Pakistan. Secure payments, localized logistics, and professional vendor tools.</p>
          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
            <Link to="/seller" className="hover:text-[#febd69] transition">Join as Vendor</Link>
            <Link to="/admin" className="hover:text-[#febd69] transition">Platform Admin</Link>
            <Link to="/" className="hover:text-[#febd69] transition">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
