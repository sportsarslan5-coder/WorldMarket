
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Order, Seller } from '../types.ts';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'sellers'>('orders');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [o, s] = await Promise.all([api.getAllOrders(), api.getAllSellers()]);
    setOrders(o.reverse());
    setSellers(s.reverse());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900 text-white p-12 flex flex-col z-50">
        <header className="mb-20">
           <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">AMZ <br/><span className="text-blue-500">PRIME HQ</span></h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mt-2">Node Controller</p>
        </header>
        
        <nav className="space-y-4 flex-1">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full text-left px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-blue-600 shadow-2xl shadow-blue-600/40' : 'text-slate-500 hover:text-white'}`}
          >
            All Transactions
          </button>
          <button 
            onClick={() => setActiveTab('sellers')} 
            className={`w-full text-left px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'sellers' ? 'bg-blue-600 shadow-2xl shadow-blue-600/40' : 'text-slate-500 hover:text-white'}`}
          >
            Registered Vendors
          </button>
        </nav>

        <div className="pt-10 border-t border-slate-800 space-y-4">
           <button onClick={loadData} className="w-full h-14 bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition">Sync Network</button>
           <p className="text-[9px] font-black text-slate-600 text-center uppercase tracking-widest">Global Payout Sync: Active</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-80 flex-1 p-16">
        <header className="mb-20 flex justify-between items-end">
           <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">{activeTab} <span className="text-slate-300">Live Grid</span></h2>
           <div className="flex gap-4">
              <span className="bg-white border border-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Total Count: {activeTab === 'orders' ? orders.length : sellers.length}</span>
           </div>
        </header>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="font-black uppercase text-xs tracking-[0.5em] animate-pulse">Establishing Cloud Relay...</p>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-8">
            {orders.length === 0 && (
              <div className="py-40 text-center bg-white rounded-[64px] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 font-black uppercase text-sm tracking-widest">Awaiting First Network Transaction</p>
              </div>
            )}
            {orders.map(o => (
              <div key={o.id} className="bg-white p-12 rounded-[56px] shadow-sm border border-slate-50 flex flex-col lg:flex-row justify-between items-center group hover:shadow-2xl transition-all animate-fade-in-up">
                <div className="space-y-4 flex-1 w-full lg:w-auto">
                   <div className="flex items-center gap-4">
                      <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black">{o.id}</span>
                      <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Commission Auto-Calc Enabled</span>
                   </div>
                   <div>
                     <h3 className="font-black text-3xl uppercase italic tracking-tighter leading-none mb-2">{o.productName}</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sold by: {o.sellerName} (/{o.sellerSlug})</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                         <p className="text-sm font-bold truncate">{o.customerName}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                         <p className="text-sm font-bold truncate">{o.customerLocation}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                         <p className="text-sm font-bold text-blue-600">{o.customerWhatsapp}</p>
                      </div>
                   </div>
                </div>
                
                <div className="mt-10 lg:mt-0 lg:ml-20 text-right flex flex-col items-end w-full lg:w-auto">
                   <p className="text-5xl font-black italic mb-6 leading-none">Rs. {o.productPrice.toLocaleString()}</p>
                   <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                      <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl text-center shadow-xl shadow-blue-600/20">
                         <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Admin (95%)</p>
                         <p className="font-black text-lg">Rs. {o.commission.adminAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl text-center shadow-xl shadow-emerald-600/20">
                         <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Seller (5%)</p>
                         <p className="font-black text-lg">Rs. {o.commission.sellerAmount.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {sellers.length === 0 && (
              <div className="col-span-full py-40 text-center bg-white rounded-[64px] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 font-black uppercase text-sm tracking-widest">No Vendors Authorized</p>
              </div>
            )}
            {sellers.map(s => (
              <div key={s.id} className="bg-white p-12 rounded-[56px] shadow-sm border border-slate-50 flex flex-col justify-between group hover:shadow-2xl transition-all animate-fade-in-up">
                <div className="space-y-8">
                  <div>
                    <h3 className="font-black text-4xl uppercase tracking-tight italic mb-2 leading-none">{s.storeName}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slug: /{s.slug}</p>
                  </div>
                  <div className="space-y-5 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-4"><span className="w-16 opacity-30">OWNER</span> <span className="text-slate-900">{s.name}</span></div>
                    <div className="flex items-center gap-4"><span className="w-16 opacity-30">CITY</span> <span className="text-slate-900">{s.location}</span></div>
                    <div className="flex items-center gap-4"><span className="w-16 opacity-30">PHONE</span> <span className="text-blue-600">{s.whatsapp}</span></div>
                    <div className="flex items-center gap-4"><span className="w-16 opacity-30">EMAIL</span> <span className="lowercase text-slate-900">{s.email}</span></div>
                  </div>
                </div>
                
                <div className="mt-12 pt-10 border-t border-slate-50 space-y-8">
                   <div className="bg-slate-900 p-8 rounded-[32px] shadow-inner">
                      <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 mb-3">Merchant Bank Detail</p>
                      <p className="font-mono text-sm font-black text-white break-all leading-relaxed uppercase">{s.bankAccount}</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest italic hover:underline cursor-pointer">Review Store Link</span>
                      <div className="h-10 px-5 bg-emerald-50 text-emerald-600 rounded-xl flex items-center text-[10px] font-black uppercase tracking-widest">
                         Live Partner
                      </div>
                   </div>
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
