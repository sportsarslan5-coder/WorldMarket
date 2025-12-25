
import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeAltIcon } from './IconComponents.tsx';

const VendorLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black italic tracking-tighter">PK<span className="text-blue-600">MART</span></Link>
        <Link to="/seller" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition">Enter Dashboard</Link>
      </nav>

      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 inline-block border border-blue-100">Now Open for 2025</span>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-10">SELL TO PAKISTAN <br/> <span className="text-blue-600">FROM ANYWHERE.</span></h1>
          <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto">Join 500+ verified vendors. We handle the traffic, you handle the inventory. Only 5% flat commission.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/seller" className="bg-blue-600 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/20 hover:scale-105 transition">Start Selling Now</Link>
            <a href="#benefits" className="bg-slate-100 text-slate-900 px-12 py-6 rounded-3xl font-black text-xl hover:bg-slate-200 transition">View Benefits</a>
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-slate-50 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Fast Deployment</h3>
            <p className="text-slate-500 font-medium">Your custom store link is ready in under 60 seconds. No complex coding required.</p>
          </div>
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">Lowest Fees</h3>
            <p className="text-slate-500 font-medium">Keep 95% of your earnings. We only take a 5% cut to keep the platform running smoothly.</p>
          </div>
          <div className="space-y-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">WhatsApp Direct</h3>
            <p className="text-slate-500 font-medium">Orders go directly to your WhatsApp. Chat with your customers and close the deal personally.</p>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-slate-100">
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Global Logistics Network &copy; 2025</p>
      </footer>
    </div>
  );
};

export default VendorLanding;
