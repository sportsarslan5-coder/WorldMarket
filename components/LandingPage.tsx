
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
          <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition">Admin HQ</Link>
        </div>
      </nav>

      <header className="py-24 md:py-48 px-8 text-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <img src="https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770054612/16AMERICANFOOTBALLMODEL_swj02j.jpg" className="w-full h-full object-cover grayscale" />
        </div>
        
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.5em]">Manufacturer Direct System</span>
          <h1 className="text-6xl md:text-[140px] font-black tracking-tighter uppercase italic leading-[0.8] mb-12">
            Sports <br/> <span className="text-blue-600">Uniforms.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic leading-relaxed">
            The world's most scalable multi-show platform. Professional grade sports manufacturing delivered from factory direct to your team.
          </p>
          <div className="pt-12 flex justify-center gap-6">
            <Link to="/sell" className="bg-slate-900 text-white px-16 py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition transform hover:-translate-y-1">Launch Your Show</Link>
          </div>
        </div>
      </header>

      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div className="aspect-[4/5] bg-slate-100 rounded-[64px] overflow-hidden shadow-inner">
              <img src="https://res.cloudinary.com/dzt2nrkjr/image/upload/v1770055149/2026_BASE_LeggettNo7Legacy_FRONT_rkrgpu.webp" className="w-full h-full object-cover" />
           </div>
           <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Global <span className="text-blue-600">Standards.</span></h2>
              <p className="text-slate-500 text-lg leading-relaxed">Our manufacturing facilities produce high-end patches, jerseys, and sports uniforms using the latest tech-fiber fabrics. Every "Show" created on our platform has access to this elite global catalog.</p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                 <div>
                    <p className="text-3xl font-black italic">PKR</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Localized Billing</p>
                 </div>
                 <div>
                    <p className="text-3xl font-black italic">7-Days</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Express</p>
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
