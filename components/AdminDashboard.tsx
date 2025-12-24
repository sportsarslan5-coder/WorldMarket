
import React, { useState, useEffect } from 'react';
import { Shop, ShopStatus, Order, AdminNotification } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.ts';

const MASTER_PIN = "PK-MART-9988";

interface AdminDashboardProps {
  notifications: AdminNotification[];
  onRefresh: () => Promise<void>;
  onToggleSellerStatus: (id: string) => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  notifications, 
  onRefresh, 
}) => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'shops' | 'orders' | 'metrics'>('shops');
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isAuth) {
      loadData();
    }
  }, [isAuth]);

  const loadData = async () => {
    const [sh, ord] = await Promise.all([api.fetchAllShops(), api.fetchAllOrders()]);
    setShops(sh);
    setOrders(ord);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN) setIsAuth(true);
    else alert("Invalid Terminal Access Code.");
  };

  const toggleShop = async (shop: Shop) => {
    const newStatus = shop.status === ShopStatus.ACTIVE ? ShopStatus.SUSPENDED : ShopStatus.ACTIVE;
    await api.updateShopStatus(shop.id, newStatus);
    await loadData();
    onRefresh();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-slate-900 p-12 md:p-20 rounded-[80px] w-full max-w-lg text-center border border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-blue-600/20">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 className="text-white text-3xl font-black uppercase tracking-[0.3em] mb-4">Master Terminal</h1>
          <p className="text-slate-500 font-bold mb-12 uppercase text-[10px] tracking-widest">Enter authentication protocol to unlock grid</p>
          <input 
            type="password" 
            placeholder="ACCESS CODE" 
            className="w-full p-8 bg-black rounded-3xl text-white font-black text-5xl text-center outline-none border-4 border-transparent focus:border-blue-600 transition tracking-[0.5em]" 
            value={pin} 
            onChange={e => setPin(e.target.value)} 
            autoFocus 
          />
          <button className="w-full bg-blue-600 py-8 rounded-[40px] font-black text-xl mt-10 text-white hover:bg-blue-700 transition shadow-2xl shadow-blue-600/20">UNLOACK NODE</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <nav className="w-full lg:w-96 bg-slate-900 text-white p-12 flex flex-col sticky top-0 h-screen overflow-y-auto">
         <div className="flex items-center gap-3 mb-24">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">PK</div>
            <span className="text-2xl font-black italic tracking-tighter">MASTER<span className="text-blue-500">_CONSOLE</span></span>
         </div>
         
         <div className="space-y-4 flex-1">
            <button onClick={() => setActiveTab('shops')} className={`w-full text-left p-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-between ${activeTab === 'shops' ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
               Vendor Grid
               <span className="bg-black/20 px-2 py-1 rounded-lg text-[10px]">{shops.length}</span>
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-between ${activeTab === 'orders' ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
               Order Stream
               <span className="bg-black/20 px-2 py-1 rounded-lg text-[10px]">{orders.length}</span>
            </button>
            <button onClick={() => setActiveTab('metrics')} className={`w-full text-left p-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-between ${activeTab === 'metrics' ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
               Global Pulse
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            </button>
         </div>

         <div className="pt-10 border-t border-white/5 space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Health</p>
               <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <div className="w-[98%] h-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500">99.9%</span>
               </div>
            </div>
            <button onClick={() => navigate('/')} className="w-full py-5 rounded-2xl border border-white/10 text-[10px] font-black uppercase text-slate-500 hover:text-white transition">Terminate Connection</button>
         </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-20 overflow-y-auto">
         <div className="flex justify-between items-end mb-16">
            <div>
               <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900">{activeTab}</h2>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Real-time Cloud Node Synchronization Active</p>
            </div>
            <button onClick={loadData} className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition">Refresh Grid</button>
         </div>

         {activeTab === 'shops' && (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {shops.map(s => (
                <div key={s.id} className="bg-white p-10 rounded-[60px] shadow-sm flex flex-col md:flex-row gap-8 justify-between items-center border border-slate-200/50 group transition-all hover:shadow-xl">
                   <div className="flex gap-6 items-center flex-1">
                      <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center font-black text-2xl text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                         {s.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-2xl font-black tracking-tighter">{s.name}</h3>
                         <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Cat: {s.category} • /{s.slug}</p>
                         <div className="flex gap-2 mt-3">
                            <span className="text-[9px] font-black text-slate-400 px-3 py-1 bg-slate-100 rounded-full">{s.whatsappNumber}</span>
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full ${s.status === ShopStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{s.status}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button onClick={() => toggleShop(s)} className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${s.status === ShopStatus.ACTIVE ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                         {s.status === ShopStatus.ACTIVE ? 'Suspend' : 'Activate'}
                      </button>
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'orders' && (
           <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-300 font-black uppercase text-sm tracking-widest">No transaction records found</p>
                </div>
              ) : orders.map(o => (
                <div key={o.id} className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-8 items-center hover:shadow-lg transition">
                   <div className="w-24 h-24 bg-slate-50 rounded-[32px] p-4 flex items-center justify-center relative overflow-hidden">
                      <img src={o.items[0]?.productImageUrl} className="max-h-full object-contain relative z-10" />
                      <div className="absolute inset-0 bg-blue-500/5 group-hover:scale-150 transition"></div>
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="text-xl font-black tracking-tight">{o.items[0]?.productName}</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Global Order ID: {o.id}</p>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-2xl font-black tracking-tighter text-slate-900">Rs. {o.totalAmount.toLocaleString()}</span>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mt-2">Store: {o.shopName}</span>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-50">
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Customer</p>
                            <p className="text-[11px] font-bold text-slate-700">{o.customerName}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Contact</p>
                            <p className="text-[11px] font-bold text-slate-700">{o.customerPhone}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Variant</p>
                            <p className="text-[11px] font-bold text-slate-700">{o.items[0].size} / {o.items[0].color}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">LIVE DISPATCH</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'metrics' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 p-12 rounded-[60px] text-white">
                 <h4 className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-4">Network GTV</h4>
                 <p className="text-5xl font-black tracking-tighter italic">Rs. {orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-12 rounded-[60px] border border-slate-200">
                 <h4 className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-4">Approved Nodes</h4>
                 <p className="text-5xl font-black tracking-tighter text-slate-900">{shops.filter(s => s.status === ShopStatus.ACTIVE).length}</p>
              </div>
              <div className="bg-blue-600 p-12 rounded-[60px] text-white">
                 <h4 className="text-blue-300 font-black uppercase text-[10px] tracking-widest mb-4">Sync Efficiency</h4>
                 <p className="text-5xl font-black tracking-tighter italic">99.8%</p>
              </div>
           </div>
         )}
      </main>
    </div>
  );
};

export default AdminDashboard;
