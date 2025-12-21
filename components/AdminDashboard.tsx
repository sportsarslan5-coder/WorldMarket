
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seller, Order, AdminNotification } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  sellers: Seller[];
  orders: Order[];
  notifications: AdminNotification[];
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
  onToggleSellerStatus: (sellerId: string) => void;
}

const SECRET_ADMIN_CODE = "PK-MART-9988"; 

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  sellers = [], 
  orders = [], 
  notifications = [], 
  onToggleSellerStatus
}) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers'>('overview');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === SECRET_ADMIN_CODE) {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Invalid Access Code. Redirecting to home...');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  const stats = useMemo(() => {
    const totalGTV = orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
    const adminShare = totalGTV * 0.95;
    const sellerShare = totalGTV * 0.05;
    return { totalGTV, adminShare, sellerShare };
  }, [orders]);

  const chartData = [
    { name: 'Admin (95%)', value: stats.adminShare },
    { name: 'Seller (5%)', value: stats.sellerShare },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#161616] p-12 rounded-[32px] border border-white/5 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase italic mb-2">Platform Master Access</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type="password" 
                placeholder="ACCESS PIN" 
                className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl text-center font-black text-white tracking-[0.5em] outline-none focus:border-[#febd69] transition"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                autoFocus
              />
              {error && <p className="text-red-500 text-[10px] font-black uppercase mt-4 text-center tracking-widest">{error}</p>}
            </div>
            <button className="w-full bg-[#febd69] text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition transform active:scale-95 shadow-xl">
              Unlock Terminal
            </button>
            <div className="text-center pt-4">
               <Link to="/" className="text-[9px] font-black text-slate-600 uppercase hover:text-white transition tracking-widest">Abort & Home</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f3f3f3] font-sans">
      <div className="w-72 bg-[#131921] text-white p-8 flex flex-col shadow-2xl shrink-0">
        <h2 className="text-2xl font-black mb-12 tracking-tighter flex items-center gap-2">
          <span className="bg-[#febd69] text-black px-2 py-0.5 rounded italic">PK</span> MASTER
        </h2>
        <nav className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-4 rounded-xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'overview' ? 'bg-[#232f3e] text-[#febd69]' : 'text-slate-400 hover:text-white'}`}>Platform Stats</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-4 rounded-xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'orders' ? 'bg-[#232f3e] text-[#febd69]' : 'text-slate-400 hover:text-white'}`}>Orders Log</button>
          <button onClick={() => setActiveTab('sellers')} className={`w-full text-left p-4 rounded-xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'sellers' ? 'bg-[#232f3e] text-[#febd69]' : 'text-slate-400 hover:text-white'}`}>Vendor Control</button>
        </nav>
        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
           <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Live Database</p>
              <p className="text-[10px] font-bold text-white italic">Synced Globally</p>
           </div>
           <button onClick={() => setIsAuthorized(false)} className="w-full text-[10px] font-black uppercase text-slate-500 hover:text-red-500 transition text-center tracking-widest">Logout</button>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Marketplace GTV</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Volume</p>
                <p className="text-4xl font-black tracking-tighter text-slate-900">Rs. {stats.totalGTV.toLocaleString()}</p>
              </div>
              <div className="bg-[#232f3e] p-8 rounded-3xl border shadow-sm text-white">
                <p className="text-[10px] font-black text-[#febd69] uppercase tracking-widest mb-2">Admin Net (95%)</p>
                <p className="text-4xl font-black tracking-tighter text-emerald-400">Rs. {stats.adminShare.toLocaleString()}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sellers Share (5%)</p>
                <p className="text-4xl font-black tracking-tighter text-orange-500">Rs. {stats.sellerShare.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[40px] border h-[500px] shadow-sm">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontWeight: 900, fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontWeight: 900, fontSize: 10}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="value" fill="#febd69" radius={[15, 15, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Platform Vendors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {sellers.map(s => (
                <div key={s.id} className="bg-white p-8 rounded-3xl border shadow-sm group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-2 h-full ${s.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-slate-900 truncate pr-4 italic uppercase tracking-tighter">{s.shopName}</h3>
                    <div className="flex flex-col items-end">
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full mb-3 shadow-sm ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {s.status}
                      </span>
                      <button 
                        onClick={() => onToggleSellerStatus(s.id)}
                        className={`text-[9px] font-black uppercase p-3 rounded-xl border transition ${s.status === 'active' ? 'border-red-100 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white' : 'border-emerald-100 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white'}`}
                      >
                        {s.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 text-[11px] font-bold border-t pt-6">
                    <div className="flex justify-between items-center"><span className="text-slate-400 uppercase tracking-widest text-[8px]">Owner</span> <span className="text-slate-900">{s.fullName}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400 uppercase tracking-widest text-[8px]">Link</span> <span className="text-blue-600">/{s.shopSlug}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400 uppercase tracking-widest text-[8px]">WhatsApp</span> <span className="text-slate-900">{s.phoneNumber}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400 uppercase tracking-widest text-[8px]">Account</span> <span className="text-slate-900 font-mono tracking-widest">{s.accountNumber}</span></div>
                  </div>
                  <Link to={`/shop/${s.shopSlug}`} target="_blank" className="mt-8 block text-center py-3 bg-slate-50 border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition">Preview Shop</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
             <h2 className="text-3xl font-black tracking-tighter uppercase italic">Unified Order Terminal</h2>
             <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Order & Items</th>
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Vendor Context</th>
                      <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer PII</th>
                      <th className="p-8 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-black italic uppercase text-xs">No global orders detected</td></tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50 transition group align-top">
                          <td className="p-8">
                             <div className="space-y-4">
                                <p className="font-black text-slate-900 mb-4 tracking-widest">#{o.id}</p>
                                {o.items.map((item, idx) => (
                                   <div key={idx} className="flex items-center gap-4 bg-white border p-3 rounded-2xl shadow-sm">
                                      <img src={item.productImageUrl} className="w-14 h-14 rounded-lg object-contain bg-slate-50" alt={item.productName} />
                                      <div className="flex-1 min-w-0">
                                         <p className="font-black text-[10px] text-slate-800 uppercase truncate">{item.productName}</p>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Qty: {item.quantity} • Rs. {item.price}</p>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </td>
                          <td className="p-8">
                             <div className="bg-slate-100 inline-block px-4 py-2 rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-200">{o.sellerName}</div>
                             <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-[0.2em]">{new Date(o.createdAt).toLocaleString()}</p>
                          </td>
                          <td className="p-8">
                             <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                   <p className="font-black text-slate-900 text-sm">{o.customerName}</p>
                                </div>
                                <p className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">{o.customerPhone}</p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-1">Delivery Address</p>
                                   <p className="text-[10px] font-bold text-slate-700 leading-relaxed uppercase">{o.customerAddress}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-8 text-right">
                             <div className="space-y-1">
                                <p className="text-3xl font-black text-emerald-600 tracking-tighter">Rs. {o.totalAmount.toLocaleString()}</p>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Payment: COD</span>
                                <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest block">Comm: Rs. {o.commissionAmount}</span>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
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
