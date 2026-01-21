
import React, { useState, useEffect } from 'react';
import { Shop, Product, Order, AdminNotification } from '../types.ts';
import { api } from '../services/api.ts';

interface AdminDashboardProps {
  notifications: AdminNotification[];
  onRefresh: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ notifications, onRefresh }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'sellers' | 'products'>('orders');
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    const [s, o] = await Promise.all([
      api.fetchAllShops(),
      api.fetchAllOrders()
    ]);
    setShops(s);
    setOrders(o.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    if (isAuth) loadData();
  }, [isAuth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'PKMART2025_SECURE') setIsAuth(true);
    else alert('Invalid Admin Protocol');
  };

  const handleManualApprove = async (orderId: string) => {
    if (!window.confirm("Manually mark this order as COMPLETED?")) return;
    setIsUpdating(true);
    await api.updateOrderStatus(orderId, 'completed');
    await loadData();
    setIsUpdating(false);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleLogin} className="bg-slate-900 p-12 rounded-[40px] shadow-2xl w-full max-w-sm border border-slate-800 text-center space-y-8 animate-fade-in">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">PK MART <br/><span className="text-green-500">Node Controller</span></h1>
          <input 
            type="password" 
            placeholder="Security Key" 
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
        <div className="text-xl font-black italic mb-12 tracking-tighter uppercase leading-none">Master<br/><span className="text-green-600">Admin</span></div>
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
        <header className="mb-16 flex justify-between items-center">
           <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">{activeTab} <span className="text-slate-400 text-2xl not-italic">Grid</span></h2>
           <button 
             onClick={onRefresh}
             className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-6 py-3 rounded-xl hover:bg-slate-200 transition"
           >
             Sync Grid
           </button>
        </header>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.map(o => (
              <div key={o.id} className={`bg-white p-8 rounded-[30px] border flex flex-col md:flex-row gap-8 hover:shadow-xl transition shadow-sm animate-fade-in ${o.status === 'completed' ? 'border-green-100' : o.status === 'failed' ? 'border-red-100' : 'border-slate-100'}`}>
                <div className="space-y-4 flex-1">
                   <div className="flex gap-3">
                      <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{o.id}</span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${o.status === 'completed' ? 'bg-green-600 text-white' : o.status === 'failed' ? 'bg-red-600 text-white' : 'bg-orange-50 text-orange-600'}`}>
                        {o.paymentMethod} • {o.status.toUpperCase()}
                      </span>
                   </div>
                   
                   <div>
                     <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{o.customerName}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{o.shopName}</p>
                     <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">{o.customerEmail}</p>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Settle Stats</p>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold">Ref ID:</span>
                         <span className="font-mono text-xs font-black bg-white px-2 py-1 rounded border border-slate-200">{o.transactionId || 'AWAITING_RELAY'}</span>
                      </div>
                   </div>

                   <div className="text-xs font-bold text-slate-600 space-y-1">
                      <p>📱 {o.customerPhone}</p>
                      <p>📍 {o.customerAddress}</p>
                   </div>
                </div>
                
                <div className="md:text-right space-y-4 flex flex-col justify-center items-end">
                   <div>
                     <p className="text-2xl font-black italic leading-none text-slate-900">Rs. {o.totalAmount.toLocaleString()}</p>
                     <p className="text-[9px] font-black text-slate-300 mt-1 uppercase tracking-widest">{new Date(o.createdAt).toLocaleString()}</p>
                   </div>
                   
                   {o.status === 'pending' && (
                     <div className="flex flex-col gap-2">
                        <div className="h-10 px-4 bg-orange-50 text-orange-600 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center">
                          Gateway: Awaiting Approval
                        </div>
                        <button 
                          disabled={isUpdating}
                          onClick={() => handleManualApprove(o.id)}
                          className="text-[9px] font-black uppercase text-slate-400 hover:text-green-600 transition"
                        >
                          Manual Force Complete
                        </button>
                     </div>
                   )}
                   {o.status === 'completed' && (
                     <div className="h-12 px-6 flex items-center gap-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                       Auto-Settled ✓
                     </div>
                   )}
                   {o.status === 'failed' && (
                     <div className="h-12 px-6 flex items-center gap-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                       Transaction Dropped
                     </div>
                   )}
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
