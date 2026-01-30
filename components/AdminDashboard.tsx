
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Order, Seller } from '../types.ts';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'sellers'>('orders');

  const load = async () => {
    const [o, s] = await Promise.all([api.getAllOrders(), api.getAllSellers()]);
    setOrders(o);
    setSellers(s);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="max-w-7xl mx-auto mb-16 flex justify-between items-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Admin <span className="text-blue-600">HQ</span></h1>
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm">
          <button onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Orders</button>
          <button onClick={() => setActiveTab('sellers')} className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest ${activeTab === 'sellers' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Sellers</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex justify-between items-center">
                <div className="space-y-1">
                   <h3 className="font-black text-xl uppercase italic leading-none">{o.productName}</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sold by: {o.sellerName}</p>
                   <p className="text-xs font-bold text-blue-600">Customer: {o.customerName} | {o.customerLocation}</p>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black mb-1">${o.productPrice}</p>
                   <div className="flex gap-2">
                     <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Seller: ${o.commission.sellerAmount.toFixed(2)}</span>
                     <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">Admin: ${o.commission.adminAmount.toFixed(2)}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-2xl uppercase tracking-tight italic mb-4">{s.storeName}</h3>
                <div className="space-y-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <p>👤 {s.name}</p>
                  <p>📍 {s.location}</p>
                  <p>🏦 {s.bankAccount}</p>
                  <p>✉️ {s.email}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                   <span className="text-[10px] text-blue-600 font-black">amzprime.us/#/{s.slug}</span>
                   <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">Active</button>
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
