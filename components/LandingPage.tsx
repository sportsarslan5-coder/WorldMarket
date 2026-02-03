
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product } from '../types.ts';

const { Link } = ReactRouterDOM as any;

const LandingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await api.getAllProducts();
        setProducts(p);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="h-20 border-b flex items-center justify-between px-6 md:px-12 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <Link to="/" className="text-2xl font-black tracking-tighter uppercase italic">
          ADMIN<span className="text-[#25D366]">PATCH</span>SHOP
        </Link>
        <div className="flex gap-4">
          <Link to="/sell" className="text-xs font-bold uppercase tracking-widest text-slate-400 py-3 hover:text-slate-900 transition">Sell with us</Link>
          <Link to="/admin" className="bg-slate-950 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Login</Link>
        </div>
      </nav>

      <header className="py-20 md:py-32 px-6 text-center border-b border-slate-50">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[#25D366] font-black text-[10px] uppercase tracking-[0.4em]">Direct Manufacturer Hub</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
            Custom Patches <br/> <span className="text-[#25D366]">& Apparel</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto italic">
            High-quality custom design manufacturing. Global shipping, elite standards, direct factory pricing.
          </p>
          <div className="pt-10">
            <button onClick={() => document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className="bg-slate-950 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">Browse Collection</button>
          </div>
        </div>
      </header>

      <main id="grid" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => (
            <div key={p.id} className="group flex flex-col product-card">
              <div className="aspect-square bg-slate-50 rounded-[40px] flex items-center justify-center p-8 mb-6 border border-slate-50 relative overflow-hidden">
                <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
                <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-xl text-[10px] font-black shadow-sm">Rs. {p.price.toLocaleString()}</div>
              </div>
              <p className="text-[#25D366] font-black text-[9px] uppercase tracking-widest mb-1">{p.category}</p>
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4">{p.name}</h3>
              <Link to="/sell" className="mt-auto w-full h-14 bg-[#25D366] text-white rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-[#128C7E] transition shadow-lg">View Product</Link>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-slate-950 text-white py-20 px-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">© 2025 ADMIN PATCH SHOP • CUSTOM APPAREL MANUFACTURING</p>
      </footer>
    </div>
  );
};

export default LandingPage;
