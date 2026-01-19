
import React, { useState, useEffect } from 'react';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const AdminDashboard: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'sellers' | 'products'>('orders');
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isAuth) {
      const load = async () => {
        const [s, o, p] = await Promise.all([
          api.fetchAllShops(),
          api.fetchAllOrders(),
          api.fetchGlobalProducts()
        ]);
        setShops(s);
        setOrders(o);
        setProducts(p);
      };
      load();
    }
  }, [isAuth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'PKMART2025_SECURE') setIsAuth(true);
    else alert('Invalid Admin Protocol');
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-slate-900 p-12 rounded-[40px] shadow-2xl w-full max-w-sm border border-slate-800 text-center space-y-8 animate-fade-in">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">PK MART <br/><span className="text-green-500">Master Control</span></h1>
          <input 
            type="password" 
            placeholder="System Passphrase" 
            className="w-full h-14 px-6 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/30 font-bold text-white text-center"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          <button className="w-full h-14 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition">Authorize Node</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col lg:flex-row font-sans text-slate-900">
      <aside className="w-full lg:w-80 bg-white border-r border-slate-100 p-8 flex flex-col h-screen sticky top-0 z-50">
        <div className="text-xl font-black italic mb-12 tracking-tighter uppercase leading-none">Admin<br/><span className="text-green-600">Console</span></div>
        <nav className="space-y-2 flex-1">
          {['orders', 'sellers', 'products'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)} 
              className={`w-full flex items-center px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition capitalize ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 lg:p-16">
        <header className="mb-16">
           <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">{activeTab} <span className="text-slate-400">Stream</span></h2>
        </header>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] text-center border border-slate-100">
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Grid idle. No orders detected.</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className="bg-white p-8 rounded-[30px] border border-slate-100 flex flex-col md:flex-row justify-between gap-8 hover:shadow-xl transition shadow-sm">
                <div className="space-y-4 flex-1">
                   <div className="flex gap-4">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{o.id}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(o.createdAt).toLocaleString()}</span>
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tight leading-none">{o.customerName}</h3>
                   <div className="text-xs font-bold text-slate-500 space-y-1">
                      <p>📞 {o.customerPhone}</p>
                      <p>📍 {o.customerAddress}</p>
                   </div>
                </div>
                <div className="md:text-right space-y-2 flex flex-col justify-center">
                   <p className="text-2xl font-black italic">Rs. {o.totalAmount.toLocaleString()}</p>
                   <p className="text-[10px] font-black uppercase text-slate-400">Merchant: {o.shopName}</p>
                   <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition">Process</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shops.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[30px] border border-slate-100 flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">{s.name}</h3>
                  <p className="text-xs font-bold text-green-600">/shop/{s.slug}</p>
                  <p className="text-[10px] text-slate-400 mt-2">WhatsApp: {s.whatsappNumber}</p>
                </div>
                <div className="flex flex-col gap-2">
                   <button className="bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100">Details</button>
                   <button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white">Suspend</button>
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
