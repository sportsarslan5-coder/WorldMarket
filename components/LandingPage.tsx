
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockProducts, mockSellers } from '../services/mockData.ts';
import { Product } from '../types.ts';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Fashion', 'Sports', 'Home'];

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans text-slate-900">
      {/* Amazon-style Nav */}
      <nav className="bg-[#131921] text-white p-4 flex flex-col md:flex-row items-center gap-6 sticky top-0 z-50">
        <Link to="/" className="text-2xl font-black text-white px-2">
          PK<span className="text-[#febd69]">-</span>MART
        </Link>
        
        <div className="flex-1 flex w-full">
          <select 
            className="bg-[#f3f3f3] text-slate-600 px-3 rounded-l-md text-xs font-bold border-r border-slate-300"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Search Amazon style..." 
            className="flex-1 p-3 outline-none text-slate-900 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-[#febd69] p-3 rounded-r-md hover:bg-[#f3a847] transition">
            <svg className="w-6 h-6 text-[#131921]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>

        <div className="flex gap-8 items-center text-xs font-bold">
          <Link to="/seller" className="hover:border border-white p-1 rounded transition">Seller Portal</Link>
          <Link to="/admin" className="hover:border border-white p-1 rounded transition">Admin Login</Link>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Returns</span>
            <span className="text-sm font-black">& Orders</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[400px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover brightness-50" 
          alt="Hero" 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-2xl">PAKISTAN'S OWN MARKETPLACE</h1>
          <p className="text-xl font-medium max-w-2xl opacity-90 drop-shadow-md">Buy directly from local vendors. We handle the quality and delivery across the nation.</p>
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-[1440px] mx-auto p-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(p => {
            const seller = mockSellers.find(s => s.id === p.sellerId);
            return (
              <div key={p.id} className="bg-white p-6 rounded-md shadow-md flex flex-col group">
                <div className="h-60 mb-4 overflow-hidden">
                  <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-105 transition duration-500" alt={p.name} />
                </div>
                <Link to={`/shop/${seller?.shopSlug}`} className="text-xs font-bold text-blue-600 hover:text-orange-600 mb-1">
                  Visit {seller?.shopName}
                </Link>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{p.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < Math.floor(p.rating) ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{p.reviewsCount}</span>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-baseline">
                    <span className="text-xs font-bold mr-0.5">Rs.</span>
                    <span className="text-2xl font-black">{p.price.toLocaleString()}</span>
                  </div>
                  <Link 
                    to={`/shop/${seller?.shopSlug}`}
                    className="bg-[#ffd814] border border-[#fcd200] px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-[#f7ca00] transition"
                  >
                    View Store
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="bg-[#232f3e] text-white p-20 mt-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-black">PK-MART Pakistan</h2>
          <p className="opacity-70 text-sm">Empowering local vendors across Lahore, Karachi, Islamabad, and beyond. Centralized logistics, trusted transactions.</p>
          <div className="flex justify-center gap-10 text-sm font-bold opacity-80">
            <Link to="/seller" className="hover:underline">Sell on PK-MART</Link>
            <Link to="/admin" className="hover:underline">Track Shipments</Link>
            <Link to="/" className="hover:underline">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
