
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
      alert(`Registration Successful! Your Store URL: ${window.location.origin}/#/${seller.slug}`);
      navigate(`/dashboard/${seller.id}`);
    } catch (err) {
      alert("Error saving data to cloud. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[48px] shadow-2xl w-full max-w-xl border border-slate-100">
        <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-8">Seller <span className="text-blue-600">Onboarding</span></h2>
        <div className="space-y-4">
          <input required placeholder="Full Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
            onChange={e => setForm({...form, name: e.target.value})} />
          <input required placeholder="Store Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
            onChange={e => setForm({...form, storeName: e.target.value})} />
          <input required placeholder="Full Address / City" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
            onChange={e => setForm({...form, location: e.target.value})} />
          <input required placeholder="WhatsApp Number" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
            onChange={e => setForm({...form, whatsapp: e.target.value})} />
          <input required type="email" placeholder="Gmail Address" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
            onChange={e => setForm({...form, email: e.target.value})} />
          <input required placeholder="Bank Account Number" className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none outline-none font-bold" 
            onChange={e => setForm({...form, bankAccount: e.target.value})} />
          
          <button disabled={loading} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl mt-6 hover:bg-blue-600 transition disabled:opacity-50">
            {loading ? 'SYCNING CLOUD...' : 'Launch Store'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerRegistration;
