
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Seller, Order, OrderStatus, AdminNotification } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  sellers: Seller[];
  orders: Order[];
  notifications: AdminNotification[];
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
  onToggleSellerStatus: (sellerId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  sellers = [], 
  orders = [], 
  notifications = [], 
  onToggleSellerStatus
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers'>('overview');

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

  return (
    <div className="flex h-screen bg-[#f3f3f3] font-sans">
      <div className="w-64 bg-[#131921] text-white p-8 flex flex-col shadow-2xl">
        <h2 className="text-2xl font-black mb-10 tracking-tighter">PK-ADMIN</h2>
        <nav className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left font-bold transition ${activeTab === 'overview' ? 'text-[#febd69]' : 'text-slate-400 hover:text-white'}`}>Platform Stats</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left font-bold transition ${activeTab === 'orders' ? 'text-[#febd69]' : 'text-slate-400 hover:text-white'}`}>Recent Orders</button>
          <button onClick={() => setActiveTab('sellers')} className={`w-full text-left font-bold transition ${activeTab === 'sellers' ? 'text-[#febd69]' : 'text-slate-400 hover:text-white'}`}>Store Management</button>
        </nav>
        <Link to="/" className="text-[10px] font-black uppercase text-slate-500 hover:text-white mt-auto">Return to Main Site</Link>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Platform Finance</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Marketplace GTV</p>
                <p className="text-3xl font-black">Rs. {stats.totalGTV.toLocaleString()}</p>
              </div>
              <div className="bg-[#232f3e] p-8 rounded-2xl border shadow-sm text-white">
                <p className="text-[10px] font-black text-[#febd69] uppercase tracking-widest mb-2">Admin Net (95%)</p>
                <p className="text-3xl font-black text-emerald-400">Rs. {stats.adminShare.toLocaleString()}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vendor Payouts (5%)</p>
                <p className="text-3xl font-black text-orange-500">Rs. {stats.sellerShare.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-2xl border h-96 shadow-sm">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#febd69" radius={[10, 10, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-3xl font-black tracking-tighter mb-10">Store Activation Logic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sellers.map(s => (
                <div key={s.id} className="bg-white p-8 rounded-2xl border shadow-sm group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${s.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black truncate pr-4">{s.shopName}</h3>
                    <div className="flex flex-col items-end">
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full mb-2 ${s.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {s.status}
                      </span>
                      <button 
                        onClick={() => onToggleSellerStatus(s.id)}
                        className={`text-[9px] font-black uppercase p-2 rounded border transition ${s.status === 'active' ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white' : 'border-emerald-200 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white'}`}
                      >
                        {s.status === 'active' ? 'Deactivate' : 'Activate Shop'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 text-[11px] font-medium border-t pt-4">
                    <p className="flex justify-between"><span className="text-slate-400">Owner:</span> <span className="text-slate-900 font-bold">{s.fullName}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Route:</span> <span className="text-blue-600 font-bold">/{s.shopSlug}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Account:</span> <span className="text-slate-900 font-mono">{s.accountNumber}</span></p>
                  </div>
                  <Link to={`/shop/${s.shopSlug}`} target="_blank" className="mt-8 block text-center py-2 bg-slate-50 border rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition">Test Link</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-in slide-in-from-right duration-500">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr><th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Order ID</th><th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Vendor</th><th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer</th><th className="p-8 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Value</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition">
                    <td className="p-8 font-black">#{o.id}</td>
                    <td className="p-8 font-bold text-slate-900">{o.sellerName}</td>
                    <td className="p-8 text-sm">
                      <p className="font-bold">{o.customerName}</p>
                      <p className="text-[10px] text-slate-400">{o.customerPhone}</p>
                    </td>
                    <td className="p-8 text-right font-black text-emerald-600">Rs. {o.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
