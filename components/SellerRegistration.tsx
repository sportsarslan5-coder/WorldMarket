
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
      alert(`Store Created Successfully! URL: ${window.location.origin}/#/${seller.slug}`);
      navigate(`/dashboard/${seller.id}`);
    } catch (err) {
      alert("Registration failed. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-10 md:p-14 rounded-[48px] shadow-2xl w-full max-w-2xl border border-slate-100 animate-fade-in-up">
        <header className="mb-10 text-center">
           <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-4">Vendor <span className="text-blue-600">Onboarding</span></h2>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Register your business on Pakistan's Digital Marketplace</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
            <input required placeholder="Owner Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Store Name</label>
            <input required placeholder="Your Brand Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, storeName: e.target.value})} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Address / City</label>
            <input required placeholder="Warehouse Address" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp Number</label>
            <input required placeholder="03XXXXXXXXX" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, whatsapp: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Gmail Address</label>
            <input required type="email" placeholder="example@gmail.com" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bank Account / IBAN</label>
            <input required placeholder="Account Number for Payouts" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
              onChange={e => setForm({...form, bankAccount: e.target.value})} />
          </div>
        </div>
        
        <button disabled={loading} className="w-full h-18 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl mt-10 hover:bg-blue-600 transition disabled:opacity-50 active:scale-95 flex items-center justify-center">
          {loading ? 'CONNECTING TO CLOUD...' : 'Launch Storefront'}
        </button>
      </form>
    </div>
  );
};

export default SellerRegistration;
