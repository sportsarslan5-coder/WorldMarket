
import React, { useState } from 'react';
import { api } from '../services/api.ts';

const AdminPanel: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: 'Electronics',
    description: '',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    // Renamed saveAdminProduct to uploadProduct
    await api.uploadProduct({
      id: `PRD-${Date.now()}`,
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category,
      imageUrl: form.image,
      createdAt: new Date().toISOString()
    });
    alert("Product Uploaded! It is now visible on all Seller Links.");
    setForm({ ...form, name: '', price: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-12 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="mb-12">
           <h1 className="text-4xl font-black italic uppercase tracking-tighter">Admin <span className="text-blue-500">Controller</span></h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Global Product Feed Management</p>
        </header>

        <form onSubmit={handleUpload} className="bg-slate-800 p-8 rounded-[40px] border border-slate-700 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Product Title</label>
            <input required className="w-full h-14 px-6 bg-slate-900 border border-slate-700 rounded-2xl font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Price ($)</label>
               <input required type="number" className="w-full h-14 px-6 bg-slate-900 border border-slate-700 rounded-2xl font-bold" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Category</label>
               <select className="w-full h-14 px-6 bg-slate-900 border border-slate-700 rounded-2xl font-bold appearance-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Electronics</option>
                  <option>Footwear</option>
                  <option>Apparel</option>
                  <option>Accessories</option>
               </select>
             </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Image URL</label>
            <input required className="w-full h-14 px-6 bg-slate-900 border border-slate-700 rounded-2xl font-bold" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Product Description</label>
            <textarea required className="w-full h-28 p-6 bg-slate-900 border border-slate-700 rounded-2xl font-bold resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <button className="w-full h-16 bg-blue-600 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition">
             Deploy Product to Global Feed
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
