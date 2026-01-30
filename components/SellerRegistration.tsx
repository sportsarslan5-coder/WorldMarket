
import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { useNavigate } from 'react-router-dom';

const SellerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    storeName: '',
    location: '',
    whatsapp: '',
    email: '',
    bankAccount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const seller = await api.registerSeller(form);
      alert(`Success! Your Store is LIVE at: ${window.location.origin}/#/${seller.slug}`);
      navigate(`/dashboard/${seller.id}`);
    } catch (err) {
      alert("Error: Cloud Connection failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 md:p-14 border border-slate-100">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Join the <span className="text-blue-600">Prime Grid</span></h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Verified Multi-Vendor Registration</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
            <input required className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Store Name</label>
            <input required className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, storeName: e.target.value})} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Business Location / Address</label>
            <input required className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp Number</label>
            <input required className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, whatsapp: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Gmail Address</label>
            <input required type="email" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bank Account Number (IBAN/Account)</label>
            <input required className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, bankAccount: e.target.value})} />
          </div>
          
          <button disabled={loading} className="md:col-span-2 w-full h-18 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition active:scale-95 flex items-center justify-center">
            {loading ? 'DEPLOYING TO CLOUD...' : 'Launch Storefront'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerRegistration;
