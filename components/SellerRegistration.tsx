
import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { useNavigate } from 'react-router-dom';

const SellerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', storeName: '', location: '', whatsapp: '', email: '', bankAccount: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const seller = await api.registerSeller(form);
      const link = `${window.location.origin}/#/${seller.slug}`;
      setSuccessLink(link);
      setTimeout(() => navigate(`/dashboard/${seller.id}`), 8000);
    } catch (err) {
      alert("Registration failed. Network Error.");
    } finally {
      setLoading(false);
    }
  };

  if (successLink) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-xl animate-slide-in">
           <div className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(37,211,102,0.3)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
           </div>
           <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-6">Distributor <span className="text-[#25D366]">Node</span> Live</h2>
           <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12">Your authorized shop link has been broadcast to the admin grid. Share it to earn 5% commission on every sale.</p>
           
           <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 mb-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#25D366] mb-6">Merchant Link</p>
              <code className="text-2xl font-mono font-bold text-white block break-all">{successLink}</code>
              <button 
                onClick={() => { navigator.clipboard.writeText(successLink); alert("Link Copied!"); }}
                className="mt-8 px-8 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition"
              >
                Copy Link
              </button>
           </div>
           
           <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.6em] animate-pulse">Syncing HQ Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[48px] shadow-2xl p-10 md:p-14 border border-slate-100 animate-slide-in">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-none">Become a <span className="text-[#25D366]">Distributor</span></h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Authorized Merchant Onboarding</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input required placeholder="Your Full Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" onChange={e => setForm({...form, name: e.target.value})} />
          <input required placeholder="Shop/Brand Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" onChange={e => setForm({...form, storeName: e.target.value})} />
          <input required placeholder="WhatsApp Number" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" onChange={e => setForm({...form, whatsapp: e.target.value})} />
          <input required type="email" placeholder="Email Address" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20" onChange={e => setForm({...form, email: e.target.value})} />
          <input required placeholder="Country & City" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20 md:col-span-2" onChange={e => setForm({...form, location: e.target.value})} />
          <input required placeholder="Bank/EasyPaisa (For Commission)" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#25D366]/20 md:col-span-2" onChange={e => setForm({...form, bankAccount: e.target.value})} />
          
          <button disabled={loading} className="md:col-span-2 w-full h-18 bg-slate-950 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-[#25D366] transition shadow-2xl disabled:opacity-50">
            {loading ? 'AUTHENTICATING...' : 'Launch Store Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRegistration;
