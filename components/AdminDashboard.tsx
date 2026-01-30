
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Order, Seller, Product } from '../types.ts';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<'orders' | 'sellers' | 'products'>('orders');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [o, s, p] = await Promise.all([api.fetchAllOrders(), api.fetchAllSellers(), api.getAllProducts()]);
    setOrders(o.reverse());
    setSellers(s.reverse());
    setProducts(p.reverse());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900 text-white p-12 flex flex-col z-50">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-20">Prime <span className="text-blue-500">HQ</span></h1>
        <nav className="space-y-4 flex-1">
          {['orders', 'sellers', 'products'].map(t => (
            <button key={t} onClick={() => setTab(t as any)} 
              className={`w-full text-left px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${tab === t ? 'bg-blue-600 shadow-2xl' : 'text-slate-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </nav>
        <button onClick={load} className="h-14 bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition">Sync Network</button>
      </aside>

      <main className="ml-80 flex-1 p-16">
        <header className="mb-20 flex justify-between items-end">
           <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">{tab} <span className="text-slate-300">Live</span></h2>
        </header>

        {loading ? <div className="py-40 text-center font-black animate-pulse">Syncing Cloud Node...</div> : (
          <div className="space-y-8">
            {tab === 'orders' && orders.map(o => (
              <div key={o.id} className="bg-white p-12 rounded-[56px] shadow-sm border flex justify-between items-center group hover:shadow-2xl transition-all">
                <div className="space-y-2">
                   <h3 className="font-black text-3xl uppercase italic tracking-tighter">{o.productName}</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vendor: {o.sellerName} | Customer: {o.customerName}</p>
                </div>
                <div className="text-right">
                   <p className="text-4xl font-black italic mb-4">Rs. {o.productPrice.toLocaleString()}</p>
                   <div className="flex gap-2">
                      <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Admin 95%: Rs. {o.commission.adminAmount.toLocaleString()}</span>
                      <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Seller 5%: Rs. {o.commission.sellerAmount.toLocaleString()}</span>
                   </div>
                </div>
              </div>
            ))}
            {tab === 'sellers' && sellers.map(s => (
              <div key={s.id} className="bg-white p-12 rounded-[56px] shadow-sm border grid grid-cols-2 md:grid-cols-3 gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Storefront</p>
                  <h3 className="font-black text-2xl uppercase italic tracking-tighter">{s.storeName}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payout Account</p>
                  <p className="font-mono text-sm font-black text-slate-900 break-all">{s.bankAccount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location</p>
                  <p className="font-black text-sm uppercase">{s.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
