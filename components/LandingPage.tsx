
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

      <section className="bg-slate-950 py-10 px-8">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 text-white">
            <div className="text-center md:text-left">
               <h3 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Commission System</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unified Merchant Protocol</p>
            </div>
            <div className="flex items-center gap-4 group">
               <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center font-black text-2xl italic group-hover:scale-110 transition">5%</div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest">Seller Share</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Distribution Incentive</p>
               </div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-4 group">
               <div className="w-16 h-16 rounded-[24px] bg-emerald-600 flex items-center justify-center font-black text-2xl italic group-hover:scale-110 transition">95%</div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest">Admin Share</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Production & Logistics</p>
               </div>
            </div>
         </div>
      </section>

      <header className="py-24 md:py-36 px-8 text-center bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.5em]">Direct Factory Node</span>
          <h1 className="text-6xl md:text-[140px] font-black tracking-tighter uppercase italic leading-[0.8] mb-12">
            Multi <br/> <span className="text-blue-600">Show Grid.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic leading-relaxed">
            Every show features professional manufacturing-direct apparel. Admin controlled, Seller powered. 7-day worldwide delivery.
          </p>
          <div className="pt-12">
            <Link to="/sell" className="bg-slate-900 text-white px-16 py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition inline-block transform hover:-translate-y-1">Start Your Show</Link>
          </div>
        </div>
      </header>

      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div className="aspect-[4/5] bg-slate-50 rounded-[64px] overflow-hidden flex items-center justify-center p-20">
              <img src="https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770055149/2026_BASE_LeggettNo7Legacy_FRONT_rkrgpu.webp" className="w-full h-full object-contain mix-blend-multiply" />
           </div>
           <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Global <br/> <span className="text-blue-600">Compliance.</span></h2>
              <p className="text-slate-500 text-lg leading-relaxed">Sellers simply create a show name. All products are managed centrally by Admin for consistency. When an order is placed, Admin receives the data on WhatsApp instantly for production start.</p>
              
              <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 mt-12">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6 italic">Protocol Summary</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between border-b pb-4">
                       <span className="font-bold text-xs uppercase tracking-widest">Production Hub</span>
                       <span className="font-black italic">USA / PAK</span>
                    </div>
                    <div className="flex justify-between border-b pb-4">
                       <span className="font-bold text-xs uppercase tracking-widest">Delivery Time</span>
                       <span className="font-black italic">7 Days</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="font-bold text-xs uppercase tracking-widest">Pricing Model</span>
                       <span className="font-black italic">$35.00 - $40.00</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <footer className="bg-white border-t py-24 px-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300 mb-4 italic">APS GRID NODE V2.5</p>
        <p className="text-xs font-bold text-slate-400 italic uppercase">© 2025 ADMIN PATCH SHOP. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
