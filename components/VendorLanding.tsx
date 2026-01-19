
import React from 'react';
import { Link } from 'react-router-dom';

const VendorLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black italic tracking-tighter">PK<span className="text-green-600"> MART</span></Link>
        <Link to="/seller" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition">Seller Login</Link>
      </nav>

      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="bg-green-50 text-green-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 inline-block border border-green-100">Pakistan's Digital Economy</span>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-10">SELL ACROSS PAKISTAN <br/> <span className="text-green-600">IN SECONDS.</span></h1>
          <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">Join hundreds of verified Pakistani vendors. Reach customers from Karachi to Gilgit. Only 5% flat commission.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/seller" className="bg-green-600 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-green-500/20 hover:scale-105 transition">Start Selling Now</Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Local Support</h3>
            <p className="text-slate-500 font-medium">Get your store running in under 2 minutes. We support Easypaisa, JazzCash, and local banks.</p>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Flat 5% Fee</h3>
            <p className="text-slate-500 font-medium">No hidden charges. Keep 95% of your hard-earned profits. We grow when you grow.</p>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Direct-to-WA</h3>
            <p className="text-slate-500 font-medium">Orders go straight to your WhatsApp. Close deals faster with direct customer communication.</p>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-slate-100">
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">PK MART Logistics Hub &copy; 2025</p>
      </footer>
    </div>
  );
};

export default VendorLanding;
