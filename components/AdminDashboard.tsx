
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seller, Order, Shop } from '../types.ts';
import { api } from '../services/api.ts';

const SECRET_ADMIN_CODE = "PK-MART-9988"; 

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'shops'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    if (isAuthorized) {
      const loadAdminData = async () => {
        const [o, s, sl] = await Promise.all([
          api.fetchAllOrders(),
          api.fetchShops(),
          api.fetchAllSellers()
        ]);
        setOrders(o);
        setShops(s);
        setSellers(sl);
      };
      loadAdminData();
    }
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === SECRET_ADMIN_CODE) setIsAuthorized(true);
    else navigate('/');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-md w-full bg-[#161616] p-12 rounded-[40px] border border-white/5 shadow-2xl">
          <h1 className="text-white font-black text-center text-xl mb-8 uppercase tracking-widest">Master Admin Entry</h1>
          <input 
            type="password" 
            placeholder="ACCESS PIN" 
            className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl text-center font-black text-white outline-none"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
          />
          <button className="w-full bg-[#febd69] py-5 rounded-2xl font-black mt-6">Unlock Terminal</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f3f3f3] font-sans">
      <div className="w-72 bg-[#131921] text-white p-8 flex flex-col">
        <h2 className="text-2xl font-black mb-12 italic uppercase">PK-MASTER</h2>
        <nav className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-4 rounded-xl font-bold uppercase tracking-widest ${activeTab === 'overview' ? 'bg-[#febd69] text-black' : 'text-slate-500'}`}>Stats</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-4 rounded-xl font-bold uppercase tracking-widest ${activeTab === 'orders' ? 'bg-[#febd69] text-black' : 'text-slate-500'}`}>Orders</button>
          <button onClick={() => setActiveTab('shops')} className={`w-full text-left p-4 rounded-xl font-bold uppercase tracking-widest ${activeTab === 'shops' ? 'bg-[#febd69] text-black' : 'text-slate-500'}`}>Shops</button>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        {activeTab === 'overview' && (
           <div className="grid grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-3xl shadow-sm border">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Orders</p>
                 <p className="text-5xl font-black italic">{orders.length}</p>
              </div>
              <div className="bg-[#232f3e] text-white p-10 rounded-3xl shadow-sm border">
                 <p className="text-xs font-black uppercase tracking-widest text-[#febd69] mb-2">Active Shops</p>
                 <p className="text-5xl font-black italic">{shops.filter(s => s.status === 'active').length}</p>
              </div>
              <div className="bg-white p-10 rounded-3xl shadow-sm border">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Registered Sellers</p>
                 <p className="text-5xl font-black italic">{sellers.length}</p>
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase italic">Master Order Log</h2>
              <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                       <tr>
                          <th className="p-8 text-[10px] font-black uppercase">Order Details</th>
                          <th className="p-8 text-[10px] font-black uppercase">Customer</th>
                          <th className="p-8 text-[10px] font-black uppercase text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {orders.map(o => (
                          <tr key={o.id} className="hover:bg-slate-50 transition">
                             <td className="p-8">
                                <p className="font-black text-slate-900 mb-4">#{o.id}</p>
                                <div className="space-y-2">
                                   {o.items.map((it, idx) => (
                                      <div key={idx} className="flex items-center gap-3 bg-white border p-2 rounded-xl">
                                         <img src={it.productImageUrl} className="w-10 h-10 object-contain rounded bg-slate-50" alt="" />
                                         <p className="text-[10px] font-black uppercase truncate">{it.productName} (x{it.quantity})</p>
                                      </div>
                                   ))}
                                </div>
                             </td>
                             <td className="p-8">
                                <p className="font-black text-slate-900">{o.customerName}</p>
                                <p className="text-[10px] text-blue-600 font-bold">{o.customerPhone}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{o.customerAddress}</p>
                             </td>
                             <td className="p-8 text-right">
                                <p className="text-3xl font-black text-emerald-600 tracking-tighter">Rs. {o.totalAmount.toLocaleString()}</p>
                                <p className="text-[8px] font-black uppercase text-slate-400 mt-2">{new Date(o.createdAt).toLocaleDateString()}</p>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
