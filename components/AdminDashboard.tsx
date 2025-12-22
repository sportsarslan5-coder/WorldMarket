
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shop, ShopStatus, Order } from '../types.ts';
import { useNavigate } from 'react-router-dom';

const MASTER_PIN = "PK-MART-9988";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'approvals' | 'shops' | 'orders' | 'payouts'>('approvals');

  useEffect(() => {
    if (isAuth) {
      loadData();
    }
  }, [isAuth]);

  const loadData = async () => {
    const s = await api.fetchAllShops();
    const o = await api.fetchAllOrders();
    setShops(s);
    setOrders(o);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN) setIsAuth(true);
    else alert("Invalid PIN.");
  };

  const approveShop = async (id: string) => {
    await api.adminApproveShop(id);
    await loadData();
    alert("Shop officially activated on PK-MART.");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-[#111] p-16 rounded-[60px] border border-white/5 w-full max-w-md text-center shadow-2xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/10">
             <div className="w-3 h-3 bg-[#febd69] rounded-full animate-ping"></div>
          </div>
          <h1 className="text-white text-2xl font-black uppercase tracking-[0.3em] mb-12">System Master</h1>
          <input type="password" placeholder="ENTER ACCESS CODE" className="w-full p-6 bg-black border-2 border-white/10 rounded-3xl text-center text-white font-black text-3xl outline-none focus:border-[#febd69] transition" value={pin} onChange={e => setPin(e.target.value)} autoFocus />
          <button className="w-full bg-[#febd69] py-6 rounded-3xl font-black text-xl mt-10 hover:shadow-xl shadow-amber-500/20 transition">UNLOCK TERMINAL</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <nav className="w-72 bg-[#131921] text-white p-10 flex flex-col">
        <h2 className="text-2xl font-black italic mb-20 tracking-tighter text-[#febd69]">MASTER NODE</h2>
        <div className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('approvals')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'approvals' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>
             Approvals {shops.filter(s => s.status === ShopStatus.PENDING_ADMIN_APPROVAL).length > 0 && <span className="ml-2 bg-red-500 text-white w-2 h-2 rounded-full inline-block"></span>}
          </button>
          <button onClick={() => setActiveTab('shops')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'shops' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>All Shops</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'orders' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>Master Orders</button>
          <button onClick={() => setActiveTab('payouts')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'payouts' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>Settlements</button>
        </div>
        <button onClick={() => navigate('/')} className="text-slate-600 text-[10px] font-black uppercase hover:text-white transition">Terminate Session</button>
      </nav>

      <main className="flex-1 p-16 overflow-auto">
        {activeTab === 'approvals' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-end">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Queue: Approvals</h2>
                <p className="text-slate-400 font-bold uppercase text-xs">Waiting for master signature</p>
             </div>
             <div className="grid gap-6">
                {shops.filter(s => s.status === ShopStatus.PENDING_ADMIN_APPROVAL).map(s => (
                  <div key={s.id} className="bg-white p-10 rounded-[50px] shadow-sm border-2 border-slate-100 flex justify-between items-center group hover:border-[#febd69] transition duration-500">
                    <div>
                       <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-3xl font-black">{s.name}</h3>
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Verified ID</span>
                       </div>
                       <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">WhatsApp: {s.whatsappNumber} • Email: {s.email}</p>
                    </div>
                    <button onClick={() => approveShop(s.id)} className="bg-emerald-500 text-white px-12 py-5 rounded-3xl font-black shadow-2xl shadow-emerald-200 active:scale-95 transition">ACTIVATE VENDOR</button>
                  </div>
                ))}
                {shops.filter(s => s.status === ShopStatus.PENDING_ADMIN_APPROVAL).length === 0 && (
                  <div className="p-32 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100">
                     <p className="text-slate-300 font-black text-sm uppercase tracking-[0.3em]">No pending approvals today.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'payouts' && (
           <div className="space-y-10">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">Settlement Hub</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {shops.filter(s => s.status === ShopStatus.ACTIVE).map(s => {
                    const shopOrders = orders.filter(o => o.shopId === s.id);
                    const totalSales = shopOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                    const commission = totalSales * 0.05;
                    const vendorDue = totalSales - commission;
                    
                    return (
                       <div key={s.id} className="bg-white p-8 rounded-[40px] border shadow-sm space-y-6">
                          <div>
                             <h4 className="font-black text-xl">{s.name}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout: {s.payoutInfo?.method || 'N/A'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Gross Sales</p>
                                <p className="font-black text-sm">Rs. {totalSales.toLocaleString()}</p>
                             </div>
                             <div className="bg-emerald-50 p-4 rounded-2xl">
                                <p className="text-[8px] font-black text-emerald-600 uppercase">Vendor Due</p>
                                <p className="font-black text-sm text-emerald-700">Rs. {vendorDue.toLocaleString()}</p>
                             </div>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 p-4 rounded-xl">
                             <p>TITLE: {s.payoutInfo?.accountTitle || '---'}</p>
                             <p>NUMBER: {s.payoutInfo?.accountNumber || '---'}</p>
                          </div>
                          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Mark as Settled</button>
                       </div>
                    );
                 })}
              </div>
           </div>
        )}

        {activeTab === 'orders' && (
           <div className="space-y-10 animate-in fade-in duration-500">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">Global Transaction Log</h2>
              <div className="bg-white rounded-[50px] border-2 border-slate-50 overflow-hidden shadow-sm">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b">
                       <tr>
                          <th className="p-10 text-[10px] font-black uppercase text-slate-400">Transaction</th>
                          <th className="p-10 text-[10px] font-black uppercase text-slate-400">Recipient</th>
                          <th className="p-10 text-[10px] font-black uppercase text-slate-400 text-right">Settlement</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {orders.map(o => (
                          <tr key={o.id} className="hover:bg-slate-50/50 transition duration-300">
                             <td className="p-10">
                                <p className="font-black text-slate-900 mb-1">{o.id}</p>
                                <p className="text-[10px] font-bold text-slate-300 uppercase">{o.shopName}</p>
                             </td>
                             <td className="p-10">
                                <p className="font-black text-slate-900">{o.customerName}</p>
                                <p className="text-[10px] text-blue-600 font-bold uppercase">{o.customerPhone}</p>
                             </td>
                             <td className="p-10 text-right">
                                <p className="text-3xl font-black text-emerald-600 tracking-tighter">Rs. {o.totalAmount.toLocaleString()}</p>
                                <p className="text-[10px] font-black uppercase text-slate-300 mt-2">{o.paymentMethod} • UNPAID</p>
                             </td>
                          </tr>
                       ))}
                       {orders.length === 0 && (
                          <tr>
                             <td colSpan={3} className="p-24 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No global sales recorded.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
