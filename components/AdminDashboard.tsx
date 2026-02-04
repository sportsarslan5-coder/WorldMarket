
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Product, Order } from '../types.ts';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
  const [adminPanelUrl, setAdminPanelUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      const [p, o] = await Promise.all([api.getGlobalProducts(), api.getAllOrders()]);
      setProducts(p);
      setOrders(o.reverse());
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-80 bg-slate-950 text-white p-12 fixed h-full z-50">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-20 leading-none">APS <span className="text-blue-500">HQ</span></h1>
        <nav className="space-y-4">
          <button onClick={() => setTab('inventory')} className={`w-full text-left px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${tab === 'inventory' ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>Inventory</button>
          <button onClick={() => setTab('orders')} className={`w-full text-left px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${tab === 'orders' ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>Orders</button>
          <button onClick={() => setTab('settings')} className={`w-full text-left px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${tab === 'settings' ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>Settings</button>
        </nav>
      </aside>

      <main className="ml-80 flex-1 p-16">
        <header className="mb-16 flex justify-between items-center">
           <div>
             <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">{tab}</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Authorized Administrative Access Only</p>
           </div>
           {tab === 'inventory' && (
             <button className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition">Add Product</button>
           )}
        </header>

        {tab === 'inventory' && (
          <div className="grid grid-cols-1 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[40px] border flex items-center justify-between">
                <div className="flex gap-8 items-center">
                   <img src={p.imageUrl} className="w-24 h-24 object-contain bg-slate-50 rounded-3xl" />
                   <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter italic">{p.name}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">$35.00 • Worldwide Price</p>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button className="h-12 px-6 bg-slate-50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest">Edit</button>
                  <button className="h-12 px-6 bg-red-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="py-20 text-center font-black text-slate-300 uppercase italic">No activity logs found</div>
            ) : orders.map(o => (
              <div key={o.id} className="bg-white p-10 rounded-[48px] border flex flex-col md:flex-row justify-between gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-600 px-3 py-1 rounded-lg">New Order</span>
                       <span className="text-[10px] font-bold text-slate-400">Order ID: {o.id}</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{o.productName}</h3>
                    <div className="flex flex-wrap gap-8">
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Customer</p>
                          <p className="font-bold">{o.customerName}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">WhatsApp</p>
                          <p className="font-bold text-emerald-600">{o.customerWhatsapp}</p>
                       </div>
                    </div>
                 </div>
                 <div className="text-right flex flex-col justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(o.createdAt).toLocaleDateString()}</p>
                    <button className="h-12 px-8 bg-slate-950 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">View Details</button>
                 </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-xl bg-white p-12 rounded-[56px] border border-slate-100 space-y-12">
             <div className="space-y-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">Admin Panel Configuration</h4>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admin Panel URL</label>
                   <input 
                     value={adminPanelUrl}
                     onChange={e => setAdminPanelUrl(e.target.value)}
                     placeholder="Enter external panel URL..." 
                     className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold outline-none transition" 
                   />
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic mt-2">Placeholder for external management bridge.</p>
                </div>
             </div>

             <div className="space-y-4 pt-8 border-t">
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Security Node</h4>
                <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl">
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Regional Restriction</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">USA / Pakistan authorized</p>
                   </div>
                   <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
