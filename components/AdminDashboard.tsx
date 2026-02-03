
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Order, Seller, Product } from '../types.ts';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<'orders' | 'sellers' | 'products'>('orders');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', price: 0, category: 'Patches', description: '', imageUrl: '' });

  const load = async () => {
    setLoading(true);
    const [o, s, p] = await Promise.all([api.fetchAllOrders(), api.fetchAllSellers(), api.getAllProducts()]);
    setOrders(o.reverse());
    setSellers(s.reverse());
    setProducts(p.reverse());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.uploadProduct(form);
    setShowModal(false);
    load();
    setForm({ name: '', price: 0, category: 'Patches', description: '', imageUrl: '' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this product globally?")) {
      await api.deleteProduct(id);
      load();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-80 bg-slate-950 text-white p-12 fixed h-full z-50">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-20 leading-none">APS <span className="text-[#25D366]">CONTROL</span></h1>
        <nav className="space-y-4">
          {['orders', 'sellers', 'products'].map(t => (
            <button key={t} onClick={() => setTab(t as any)} 
              className={`w-full text-left px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${tab === t ? 'bg-[#25D366] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </nav>
      </aside>

      <main className="ml-80 flex-1 p-16">
        <header className="mb-16 flex justify-between items-end">
           <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">{tab}</h2>
           {tab === 'products' && (
             <button onClick={() => setShowModal(true)} className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">New Product</button>
           )}
        </header>

        {loading ? <div className="py-20 text-[#25D366] font-black italic text-center animate-pulse">Establishing Node Sync...</div> : (
          <div className="space-y-6">
            {tab === 'products' && products.map(p => (
              <div key={p.id} className="bg-white p-10 rounded-[40px] border flex justify-between items-center animate-slide-in">
                 <div className="flex gap-8 items-center">
                    <img src={p.imageUrl} className="w-20 h-20 object-contain bg-slate-50 rounded-2xl" />
                    <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter italic">{p.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.category} • Rs. {p.price}</p>
                    </div>
                 </div>
                 <button onClick={() => handleDelete(p.id)} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">Delete Product</button>
              </div>
            ))}
            {tab === 'orders' && orders.map(o => (
              <div key={o.id} className="bg-white p-10 rounded-[40px] border flex justify-between items-center animate-slide-in">
                 <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter italic mb-1">{o.productName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer: {o.customerName} | WA: {o.customerWhatsapp}</p>
                 </div>
                 <div className="text-right">
                    <p className="font-black text-lg text-[#25D366]">Rs. {o.productPrice}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Ref: /{o.sellerSlug}</p>
                 </div>
              </div>
            ))}
            {tab === 'sellers' && sellers.map(s => (
              <div key={s.id} className="bg-white p-10 rounded-[40px] border flex justify-between items-center animate-slide-in">
                 <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter italic mb-1">{s.storeName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner: {s.name} | Link: /{s.slug}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="font-black text-emerald-500 uppercase">Live Node</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <form onSubmit={handleUpload} className="bg-white p-12 rounded-[56px] max-w-2xl w-full relative animate-slide-in">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-2xl font-black">✕</button>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-10">Product Deployment</h3>
            <div className="space-y-6">
              <input required placeholder="Title" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setForm({...form, name: e.target.value})} />
              <input required type="number" placeholder="Price (PKR)" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setForm({...form, price: Number(e.target.value)})} />
              <select className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none appearance-none" onChange={e => setForm({...form, category: e.target.value})}>
                 <option>Patches</option>
                 <option>Apparel</option>
                 <option>Custom Gear</option>
              </select>
              <input required placeholder="Image URL" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setForm({...form, imageUrl: e.target.value})} />
              <textarea required placeholder="Brief Description" className="w-full h-24 p-6 bg-slate-50 rounded-2xl font-bold outline-none resize-none" onChange={e => setForm({...form, description: e.target.value})} />
              <button className="w-full h-18 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Deploy to Grid</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
