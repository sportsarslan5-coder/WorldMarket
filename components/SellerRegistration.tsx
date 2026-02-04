
import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { useNavigate } from 'react-router-dom';

const SellerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    sellerName: '', 
    whatsapp: '',
    email: '',
    country: 'Pakistan',
    city: '',
    contactNumber: '',
    paymentDetails: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const show = await api.registerShow(form);
      const shareUrl = api.getProductionUrl(show.slug);
      setSuccess(shareUrl);
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-12 shadow-[0_0_60px_rgba(37,99,235,0.4)] animate-bounce">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-8">Registration <span className="text-blue-500">Sent.</span></h2>
        <div className="bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[56px] border border-white/10 max-w-2xl w-full mb-12">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-8">Your Show Link (Share with Customers)</p>
           <code className="text-xl md:text-2xl font-mono font-bold block break-all mb-10 select-all">{success}</code>
           <button 
             onClick={() => { navigator.clipboard.writeText(success); alert("Link Copied!"); }}
             className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition"
           >
             Copy Link
           </button>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Data has been sent to Admin WhatsApp for activation.</p>
        <button onClick={() => window.location.href = success} className="text-blue-500 font-black uppercase tracking-widest hover:underline italic">Enter Storefront →</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 py-20">
      <div className="w-full max-w-2xl">
        <div className="mb-16 text-center">
           <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">Seller <span className="text-blue-600">Onboarding</span></h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Direct Factory Partnership Program</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Show Name</label>
              <input required placeholder="e.g., Islam Brother" className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all" 
                onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Name</label>
              <input required className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all" 
                onChange={e => setForm({...form, sellerName: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">WhatsApp Number</label>
              <input required placeholder="+92 ..." className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all" 
                onChange={e => setForm({...form, whatsapp: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email (Gmail)</label>
              <input required type="email" className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all" 
                onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Country</label>
              <select className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all appearance-none"
                value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                <option value="Pakistan">Pakistan</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">City</label>
              <input required className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all" 
                onChange={e => setForm({...form, city: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Seller Contact Number</label>
            <input required className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all" 
              onChange={e => setForm({...form, contactNumber: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
              {form.country === 'Pakistan' ? 'JazzCash Account Number' : 'Bank Account Details (IBAN / Name / Holder)'}
            </label>
            <input required className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition-all" 
              placeholder={form.country === 'Pakistan' ? '03xxxxxxxxx' : 'Bank Name, IBAN...'}
              onChange={e => setForm({...form, paymentDetails: e.target.value})} />
          </div>
          
          <button disabled={loading} className="w-full h-20 bg-slate-900 text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-blue-600 transition-all transform active:scale-95 disabled:opacity-50">
            {loading ? 'SYNCHRONIZING...' : 'Create My Show & Notify Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRegistration;
