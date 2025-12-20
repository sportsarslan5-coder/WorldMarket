
import React, { useState, useMemo } from 'react';
import { Seller, Order, OrderStatus, AdminNotification } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  sellers: Seller[];
  orders: Order[];
  notifications: AdminNotification[];
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ sellers = [], orders = [], notifications = [], onUpdateOrders }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers' | 'payouts' | 'notifications'>('overview');

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalCommission = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0); // 5% pool
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    return { totalSales, totalCommission, pendingOrders };
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    onUpdateOrders(updated);
  };

  const chartData = useMemo(() => [
    { name: 'Gross Volume', value: stats.totalSales },
    { name: 'Seller Shares', value: stats.totalCommission },
    { name: 'Net Profit', value: stats.totalSales - stats.totalCommission },
  ], [stats]);

  const formatCurrency = (val: number) => `Rs. ${(val || 0).toLocaleString()}`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col shadow-2xl">
        <div className="p-8 text-2xl font-black border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg shadow-lg shadow-green-500/20"></div>
          PK-ADMIN
        </div>
        <nav className="p-4 space-y-2 mt-4 flex-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'orders', label: `Master Orders`, icon: '📦' },
            { id: 'sellers', label: 'Vendor Registry', icon: '🏢' },
            { id: 'payouts', label: 'Settlements', icon: '💰' },
            { id: 'notifications', label: 'Alert Log', icon: '🔔' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 font-bold ${activeTab === tab.id ? 'bg-green-600 shadow-xl text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-10">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Platform Command</h2>
              <p className="text-slate-500 font-medium">Global operational and financial health.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Sales', value: formatCurrency(stats.totalSales), color: 'text-green-600' },
                { label: 'Vendor Payouts', value: formatCurrency(stats.totalCommission), color: 'text-blue-600' },
                { label: 'Active Shops', value: sellers.length, color: 'text-slate-800' },
                { label: 'Pending Logistics', value: stats.pendingOrders, color: 'text-orange-500' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">{stat.label}</div>
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 min-h-[400px]">
              <h3 className="font-black mb-8 text-xl text-slate-800">Revenue Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                      {chartData.map((_, i) => <Cell key={i} fill={i === 2 ? '#10b981' : i === 1 ? '#6366f1' : '#3b82f6'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Vendor PII Data (Private)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sellers.map(seller => (
                <div key={seller.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900">{seller.shopName}</h4>
                      <p className="text-green-600 font-bold text-xs">/shop/{seller.shopSlug}</p>
                    </div>
                    <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase">{seller.payoutMethod}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Owner</label>
                      <p className="text-sm font-bold text-slate-800">{seller.fullName}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Gmail</label>
                      <p className="text-sm font-bold text-slate-800 truncate">{seller.email}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">WhatsApp</label>
                      <p className="text-sm font-bold text-slate-800">{seller.phoneNumber}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                      <label className="text-[10px] font-black text-green-700 uppercase block mb-1">Payout Account</label>
                      <p className="text-sm font-black text-green-800">{seller.accountNumber}</p>
                    </div>
                  </div>
                  {seller.bankName && <p className="mt-4 text-[10px] font-black text-slate-400 italic text-right">Bank: {seller.bankName}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Settlement Ledger (5% Vendor Share)</h2>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout Detail</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Owed</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sellers.map(seller => {
                    const deliveredOrders = orders.filter(o => o.sellerId === seller.id && o.status === OrderStatus.DELIVERED);
                    const totalOwed = deliveredOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
                    return (
                      <tr key={seller.id} className="hover:bg-slate-50 transition">
                        <td className="p-8">
                          <p className="font-black text-slate-900">{seller.shopName}</p>
                          <p className="text-[10px] font-bold text-slate-400">{seller.fullName}</p>
                        </td>
                        <td className="p-8">
                          <p className="font-bold text-sm text-slate-700">{seller.payoutMethod}</p>
                          <p className="font-mono text-xs text-slate-400">{seller.accountNumber}</p>
                        </td>
                        <td className="p-8 text-right font-black text-green-600 text-lg">{formatCurrency(totalOwed)}</td>
                        <td className="p-8 text-right">
                          <button disabled={totalOwed === 0} className={`px-6 py-3 rounded-xl font-black text-xs shadow-lg transition ${totalOwed === 0 ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-black transform hover:-translate-y-1'}`}>
                            Transfer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders and Notifications tabs remain as robust Master Logs */}
        {activeTab === 'orders' && (
           <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
             <table className="w-full">
               <thead className="bg-slate-50">
                 <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer & Shop</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {orders.map(o => (
                    <tr key={o.id} className="border-t border-slate-50">
                       <td className="p-8 font-black text-slate-900">#{o.id}</td>
                       <td className="p-8">
                          <p className="font-black text-slate-800">{o.customerName}</p>
                          <p className="text-xs text-slate-400">Sold by: {o.sellerName}</p>
                       </td>
                       <td className="p-8 text-right">
                          <select 
                            value={o.status} 
                            onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                            className="bg-slate-50 border-none font-black text-xs rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </td>
                    </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
