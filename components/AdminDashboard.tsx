
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Product, Order } from '../types.ts';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, o] = await Promise.all([api.getGlobalProducts(), api.getAllOrders()]);
    setProducts(p.reverse());
    setOrders(o.reverse());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-80 bg-slate-950 text-white p-12 fixed h-full z-50">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-20 leading-none">APS <span className="text-blue-500">ADMIN</span></h1>
        <nav className="space-y-4">
          <button onClick={() => setTab('products')} className={`w-full text-left px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${tab === 'products' ? 'bg-blue-600' : 'text-slate-500 hover:text-white'}`}>Inventory</button>
          <button onClick={() => setTab('orders')} className={`w-full text-left px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${tab === 'orders' ? 'bg-blue-600' : 'text-slate-500 hover:text-white'}`}>Show Orders</button>
        </nav>
      </aside>

      <main className="ml-80 flex-1 p-16">
        <header className="mb-16">
           <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">{tab}</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Global Network Controller</p>
        </header>

        <div className="space-y-6">
           {tab === 'products' && products.map(p => (
             <div key={p.id} className="bg-white p-8 rounded-[40px] border flex items-center justify-between animate-fade-in-up">
                <div className="flex gap-8 items-center">
                   <img src={p.imageUrl} className="w-24 h-24 object-contain bg-slate-50 rounded-3xl" />
                   <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter italic">{p.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">$35.00 • Global Fixed Price</p>
                   </div>
                </div>
                <span className="bg-emerald-100 text-emerald-600 px-6 py-2 rounded-full text-[10px] font-black uppercase">Active on all shows</span>
             </div>
           ))}

           {tab === 'orders' && orders.length === 0 && (
             <div className="py-20 text-center text-slate-400 font-black italic uppercase tracking-widest">No Active Orders Yet</div>
           )}

           {tab === 'orders' && orders.map(o => (
             <div key={o.id} className="bg-white p-8 rounded-[40px] border flex items-center justify-between animate-fade-in-up">
                <div>
                   <h3 className="font-black text-2xl uppercase tracking-tighter italic">{o.productName}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer: {o.customerName} • Show: /show/{o.showSlug}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Awaiting Fulfillment</p>
                   <p className="font-bold text-slate-400">{o.customerWhatsapp}</p>
                </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
