
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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (isAuth) {
      const load = async () => {
        const [s, o, p] = await Promise.all([
          api.fetchAllShops(),
          api.fetchAllOrders(),
          api.fetchGlobalProducts()
        ]);
        setShops(s);
        setOrders(o.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleLogin} className="bg-slate-900 p-12 rounded-[40px] shadow-2xl w-full max-w-sm border border-slate-800 text-center space-y-8 animate-fade-in">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">PK MART <br/><span className="text-green-500">Master Control</span></h1>
          <input 
            type="password" 
            placeholder="System Passphrase" 
            className="w-full h-14 px-6 bg-slate-800 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/30 font-bold text-white text-center"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          <button className="w-full h-14 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition">Authorize Access</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col lg:flex-row font-sans text-slate-900">
      <aside className="w-full lg:w-80 bg-white border-r border-slate-100 p-8 flex flex-col h-screen sticky top-0 z-50">
        <div className="text-xl font-black italic mb-12 tracking-tighter uppercase leading-none">Admin<br/><span className="text-green-600">Control Hub</span></div>
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
        {notifications.length > 0 && (
          <div className="mt-8 p-4 bg-red-50 rounded-2xl">
             <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">Active Alerts: {notifications.length}</p>
          </div>
        )}
      </aside>

      <main className="flex-1 p-8 lg:p-16">
        <header className="mb-16 flex justify-between items-center">
           <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">{activeTab} <span className="text-slate-400 text-2xl not-italic">Log</span></h2>
           <button 
             onClick={() => onRefresh()}
             className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-6 py-3 rounded-xl hover:bg-slate-200 transition"
           >
             Refresh Data
           </button>
        </header>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] text-center border border-slate-100">
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">No orders detected on grid.</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className={`bg-white p-8 rounded-[30px] border flex flex-col md:flex-row gap-8 hover:shadow-xl transition shadow-sm animate-fade-in ${o.status === 'completed' ? 'border-green-100 bg-green-50/10' : 'border-slate-100'}`}>
                <div className="space-y-4 flex-1">
                   <div className="flex gap-3">
                      <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{o.id}</span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${o.status === 'completed' ? 'bg-green-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        {o.paymentMethod} • {o.status.toUpperCase()}
                      </span>
                      {o.status === 'completed' && (
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700 animate-pulse">
                          ✓ Payment Received (03079490721)
                        </span>
                      )}
                   </div>
                   <div>
                     <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{o.customerName}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{o.shopName}</p>
                   </div>
                   <div className="text-xs font-bold text-slate-500 space-y-1 bg-white/50 p-4 rounded-xl border border-slate-100">
                      <p className="flex items-center gap-2">📞 {o.customerPhone}</p>
                      <p className="flex items-center gap-2">📍 {o.customerAddress}</p>
                      {o.transactionId && <p className="text-blue-600 font-black uppercase tracking-widest text-[9px]">TID: {o.transactionId}</p>}
                   </div>
                </div>
                
                <div className="md:text-right space-y-4 flex flex-col justify-center items-end">
                   <div className="text-right">
                     <p className="text-2xl font-black italic leading-none text-slate-900">Rs. {o.totalAmount.toLocaleString()}</p>
                     <p className="text-[9px] font-black text-slate-300 mt-1 uppercase tracking-widest">{new Date(o.createdAt).toLocaleString()}</p>
                   </div>
                   
                   <div className="flex gap-2">
                     {o.paymentScreenshot && (
                       <button 
                         onClick={() => setSelectedScreenshot(o.paymentScreenshot!)}
                         className="h-10 px-4 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition"
                       >
                         View Receipt
                       </button>
                     )}
                     {o.status !== 'completed' && (
                       <button className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition shadow-lg">Mark Shipped</button>
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedScreenshot && (
        <div className="fixed inset-0 bg-slate-900/90 z-[500] flex items-center justify-center p-8" onClick={() => setSelectedScreenshot(null)}>
           <div className="max-w-4xl max-h-full overflow-hidden bg-white p-2 rounded-3xl animate-fade-in shadow-2xl relative">
              <img src={selectedScreenshot} className="max-h-[80vh] object-contain rounded-2xl" alt="Proof of Payment" />
              <button className="absolute -top-4 -right-4 bg-white w-10 h-10 rounded-full font-black text-slate-900 shadow-xl">✕</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
