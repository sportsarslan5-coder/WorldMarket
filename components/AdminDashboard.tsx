
import React, { useState } from 'react';
import { Shop, ShopStatus, Order, Seller, AdminNotification } from '../types.ts';
import { useNavigate } from 'react-router-dom';

const MASTER_PIN = "PK-MART-9988";

interface AdminDashboardProps {
  shops: Shop[];
  sellers: Seller[];
  orders: Order[];
  notifications: AdminNotification[];
  onRefresh: () => Promise<void>;
  onToggleSellerStatus: (id: string) => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  shops, 
  sellers,
  orders, 
  notifications, 
  onRefresh, 
  onToggleSellerStatus 
}) => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'approvals' | 'shops' | 'orders' | 'payouts' | 'notifications'>('approvals');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN) setIsAuth(true);
    else alert("Invalid Access Pin.");
  };

  const approveShop = async (id: string) => {
    await onToggleSellerStatus(id); 
    await onRefresh();
    alert("Shop activated on PK-MART global node.");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-[#111] p-12 md:p-16 rounded-[60px] border border-white/5 w-full max-w-md text-center shadow-2xl">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-white/10">
             <div className="w-3 h-3 bg-[#febd69] rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-white text-2xl font-black uppercase tracking-[0.3em] mb-12">Terminal Login</h1>
          <input 
            type="password" 
            placeholder="ACCESS CODE" 
            className="w-full p-6 bg-black border-2 border-white/10 rounded-3xl text-center text-white font-black text-3xl outline-none focus:border-[#febd69] transition" 
            value={pin} 
            onChange={e => setPin(e.target.value)} 
            autoFocus 
          />
          <button className="w-full bg-[#febd69] py-6 rounded-3xl font-black text-xl mt-10 hover:shadow-xl shadow-amber-500/20 transition active:scale-95">
            UNLOCK MASTER NODE
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      <nav className="w-full md:w-72 bg-[#131921] text-white p-8 flex flex-col">
        <h2 className="text-2xl font-black italic mb-12 tracking-tighter text-[#febd69]">MASTER NODE</h2>
        <div className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('approvals')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'approvals' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>
             Approvals {shops.filter(s => s.status === ShopStatus.PENDING_ADMIN_APPROVAL).length > 0 && <span className="ml-2 bg-red-500 text-white px-2 rounded-full">!</span>}
          </button>
          <button onClick={() => setActiveTab('shops')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'shops' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>All Shops</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'orders' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>Master Orders</button>
          <button onClick={() => setActiveTab('payouts')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'payouts' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>Settlements</button>
          <button onClick={() => setActiveTab('notifications')} className={`w-full text-left p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${activeTab === 'notifications' ? 'bg-[#febd69] text-black' : 'text-slate-500 hover:bg-white/5'}`}>
            AI Alerts {notifications.length > 0 && <span className="ml-2 bg-[#febd69] text-black px-2 rounded-full text-[10px] font-black">{notifications.length}</span>}
          </button>
        </div>
        <button onClick={() => navigate('/')} className="mt-10 text-slate-600 text-[10px] font-black uppercase hover:text-white transition">Terminate Session</button>
      </nav>

      <main className="flex-1 p-8 md:p-16 overflow-auto">
        {activeTab === 'approvals' && (
          <div className="space-y-10">
             <div className="flex justify-between items-end">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Queue: Approvals</h2>
             </div>
             <div className="grid gap-6">
                {shops.filter(s => s.status === ShopStatus.PENDING_ADMIN_APPROVAL).map(s => (
                  <div key={s.id} className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-[#febd69] transition">
                    <div>
                       <h3 className="text-3xl font-black">{s.name}</h3>
                       <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">WhatsApp: {s.whatsappNumber} • Email: {s.email}</p>
                    </div>
                    <button 
                      onClick={() => approveShop(s.ownerId)} 
                      className="mt-6 md:mt-0 bg-[#febd69] text-black px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition active:scale-95"
                    >
                      APPROVE VENDOR
                    </button>
                  </div>
                ))}
                {shops.filter(s => s.status === ShopStatus.PENDING_ADMIN_APPROVAL).length === 0 && (
                  <div className="bg-white p-20 rounded-[50px] text-center border-4 border-dashed border-slate-100">
                    <p className="text-slate-300 font-black text-sm uppercase tracking-widest">Queue Clear.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-10">
             <h2 className="text-5xl font-black italic uppercase tracking-tighter">Settlements</h2>
             <div className="bg-white rounded-[50px] overflow-hidden border border-slate-100 p-10">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Account Title</th>
                      <th className="p-4">Account Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map(s => (
                      <tr key={s.id} className="border-t border-slate-50">
                        <td className="p-4 font-black">{s.fullName}</td>
                        <td className="p-4">
                           <span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black uppercase">{s.payoutInfo?.method}</span>
                        </td>
                        <td className="p-4 font-bold">{s.payoutInfo?.accountTitle}</td>
                        <td className="p-4 font-mono text-sm">{s.payoutInfo?.accountNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-10">
             <h2 className="text-5xl font-black italic uppercase tracking-tighter">Master Orders</h2>
             <div className="bg-white rounded-[50px] overflow-hidden border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-6">ID</th>
                      <th className="p-6">Shop</th>
                      <th className="p-6">Customer</th>
                      <th className="p-6">Total</th>
                      <th className="p-6">Commission (5%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className="p-6 font-bold">{o.id}</td>
                        <td className="p-6 font-bold text-blue-600">{o.shopName}</td>
                        <td className="p-6 font-bold">{o.customerName}</td>
                        <td className="p-6 font-black">Rs. {o.totalAmount.toLocaleString()}</td>
                        <td className="p-6 font-black text-emerald-600">Rs. {(o.totalAmount * 0.05).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-10">
             <h2 className="text-5xl font-black italic uppercase tracking-tighter">AI Alerts</h2>
             <div className="space-y-6">
                {notifications.map(n => (
                  <div key={n.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                       <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{n.type}</span>
                       <span className="text-slate-400 text-[10px] font-bold">{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">WhatsApp Draft</p>
                          <div className="p-4 bg-slate-50 rounded-2xl text-sm font-medium border border-slate-100 whitespace-pre-wrap">{n.content.whatsapp}</div>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Email Payload</p>
                          <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl text-[11px] font-mono border border-slate-800 whitespace-pre-wrap">{n.content.email}</div>
                       </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="bg-white p-20 rounded-[50px] text-center border-4 border-dashed border-slate-100">
                    <p className="text-slate-300 font-black text-sm uppercase tracking-widest">No terminal events logged.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'shops' && (
          <div className="space-y-10">
             <h2 className="text-5xl font-black italic uppercase tracking-tighter">Inventory: Shops</h2>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {shops.map(s => (
                  <div key={s.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center shadow-sm">
                    <div>
                      <h3 className="text-xl font-black">{s.name}</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase">{s.category} • {s.status}</p>
                    </div>
                    <button onClick={() => onToggleSellerStatus(s.ownerId)} className={`text-[10px] font-black uppercase px-6 py-2 rounded-full transition ${s.status === ShopStatus.ACTIVE ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {s.status === ShopStatus.ACTIVE ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
