
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="h-24 border-b flex items-center justify-between px-8 md:px-20 sticky top-0 bg-white/90 backdrop-blur-xl z-50">
        <Link to="/" className="text-2xl font-black tracking-tighter uppercase italic">
          APS <span className="text-blue-600">PREMIUM</span>
        </Link>
        <div className="flex gap-8">
          <Link to="/sell" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition">Create Show</Link>
          <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition">Admin Login</Link>
        </div>
      </nav>

      {/* Commission Transparency Section */}
      <section className="bg-slate-950 py-6 px-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 text-white overflow-hidden">
         <div className="flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Merchant Split</span>
            <div className="flex items-baseline gap-2">
               <span className="text-2xl font-black italic">5%</span>
               <span className="text-[10px] font-bold text-slate-400">SELLER</span>
            </div>
         </div>
         <div className="w-px h-8 bg-white/10 hidden md:block"></div>
         <div className="flex items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">Platform Split</span>
            <div className="flex items-baseline gap-2">
               <span className="text-2xl font-black italic">95%</span>
               <span className="text-[10px] font-bold text-slate-400">ADMIN</span>
            </div>
         </div>
      </section>

      <header className="py-24 md:py-36 px-8 text-center bg-slate-50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.5em]">Global Manufacturing Grid</span>
          <h1 className="text-6xl md:text-[120px] font-black tracking-tighter uppercase italic leading-[0.8] mb-12">
            Sports <br/> <span className="text-blue-600">Apparel.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic leading-relaxed">
            Professional multi-vendor system with zero-setup shows. Permanent shared links for global distribution.
          </p>
          <div className="pt-12">
            <Link to="/sell" className="bg-slate-900 text-white px-16 py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition inline-block transform hover:-translate-y-1">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div className="aspect-[4/5] bg-slate-100 rounded-[64px] overflow-hidden shadow-inner">
              <img src="https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770055149/2026_BASE_LeggettNo7Legacy_FRONT_rkrgpu.webp" className="w-full h-full object-cover" />
           </div>
           <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Unified <br/> <span className="text-blue-600">Inventory.</span></h2>
              <p className="text-slate-500 text-lg leading-relaxed">Every show on the APS grid features our direct-from-factory catalog. Sellers focus on distribution; we handle the manufacturing and logistics from our USA and Pakistan hubs.</p>
              
              <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 mt-12">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Official Commission Protocol</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between border-b pb-4">
                       <span className="font-bold">Seller Share</span>
                       <span className="font-black italic">5.0%</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="font-bold">Manufacturing/Admin</span>
                       <span className="font-black italic">95.0%</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white py-24 px-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-600 mb-4">APS MANUFACTURING HUB • EST 2025</p>
        <p className="text-xs font-bold text-slate-500">© 2025 ADMIN PATCH SHOP. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
