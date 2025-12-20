
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  sellers = [], 
  orders = [], 
  notifications = [], 
  onUpdateOrders
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers' | 'payouts' | 'notifications'>('overview');

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalCommission = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    return { totalSales, totalCommission, pendingOrders };
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    onUpdateOrders(updated);
  };

  const chartData = useMemo(() => [
    { name: 'Collections', value: stats.totalSales },
    { name: 'Vendor Owed', value: stats.totalCommission },
    { name: 'Platform Net', value: Math.max(0, stats.totalSales - stats.totalCommission) },
  ], [stats]);

  const formatCurrency = (val: number) => `Rs. ${(val || 0).toLocaleString()}`;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f3f3f3] overflow-hidden font-sans">
      <div className="w-full lg:w-72 bg-[#131921] text-white flex-shrink-0 shadow-2xl flex flex-col">
        <div className="p-8 text-2xl font-black border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg shadow-lg"></div>
          PK-ADMIN
        </div>
        <nav className="p-4 space-y-2 mt-4 flex-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'orders', label: `Orders (${stats.pendingOrders})`, icon: '📦' },
            { id: 'sellers', label: 'Security (PII)', icon: '🛡️' },
            { id: 'payouts', label: 'Disbursements', icon: '💰' },
            { id: 'notifications', label: 'AI Alert Center', icon: '🔔' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full text-left p-4 rounded-md transition-all flex items-center gap-3 font-bold ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-10">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Marketplace Command</h2>
                <p className="text-slate-500 font-medium">Monitoring centralized funds and vendor PII pipelines.</p>
              </div>
              <div className="text-sm font-bold bg-white px-5 py-2 rounded-lg border border-slate-200 text-emerald-600">
                Health: <span className="text-emerald-500">Active</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Platform GTV', value: formatCurrency(stats.totalSales), color: 'text-emerald-600' },
                { label: 'Vendor Debt (5%)', value: formatCurrency(stats.totalCommission), color: 'text-blue-600' },
                { label: 'Registered PII', value: sellers.length, color: 'text-slate-800' },
                { label: 'Logistics Queue', value: stats.pendingOrders, color: 'text-orange-500' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">{stat.label}</div>
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-black mb-10 text-xl text-slate-800">Financial Flow Allocation</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
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
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Confidential Vendor PII Log</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {sellers.map((seller) => (
                <div key={seller.id} className="bg-white p-10 rounded-2xl border border-slate-200 relative group overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition">
                    <span className="text-7xl font-black">🏢</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 leading-tight">{seller.shopName}</h4>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Store: /shop/{seller.shopSlug}</p>
                      </div>
                      <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-md uppercase">{seller.payoutMethod}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase">Legal Name</label>
                        <p className="text-sm font-black text-slate-700">{seller.fullName}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase">Verified Gmail</label>
                        <p className="text-sm font-black text-slate-700 truncate underline">{seller.email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase">WhatsApp</label>
                        <p className="text-sm font-black text-slate-700">{seller.phoneNumber}</p>
                      </div>
                      <div className="space-y-1 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                        <label className="block text-[10px] font-black text-emerald-700 uppercase mb-1">Account Detail</label>
                        <p className="text-sm font-black text-emerald-800 font-mono">{seller.accountNumber}</p>
                        {seller.bankName && <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">{seller.bankName}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Master Shipment Queue</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Source & Destination</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform GTV</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-6 text-sm font-black text-slate-900">#{order.id}</td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-slate-800 mb-1">{order.customerName} <span className="opacity-40 text-[10px]">BUYING FROM</span> {order.sellerName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{order.customerPhone} • {order.customerAddress}</div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-emerald-600">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-8 py-6">
                        <select 
                          className="border border-slate-200 rounded-md p-2.5 text-xs font-black outline-none bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        >
                          {Object.values(OrderStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-800">Intelligence Log (AI Drafts)</h2>
            <div className="space-y-8">
              {notifications.map(notif => (
                <div key={notif.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-8 py-4 bg-[#131921] text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{notif.type === 'NEW_SELLER' ? '👤' : '📦'}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notif.type.replace('_', ' ')} Detected</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <span className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center text-[10px] text-white font-black">W</span> WhatsApp Payload
                      </h4>
                      <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100/50 text-sm font-medium text-emerald-900 italic leading-relaxed">
                        "{notif.content?.whatsapp || 'System error drafting message.'}"
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <span className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-[10px] text-white font-black">E</span> Email Template
                      </h4>
                      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 text-sm font-medium text-blue-900 italic leading-relaxed whitespace-pre-line">
                        "{notif.content?.email || 'System error drafting email.'}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financial Disbursements (5% Commission)</h2>
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
              <p className="mb-12 text-slate-500 font-medium max-w-2xl leading-relaxed">PK-MART collects 100% of customer funds. We hold these until delivery is confirmed, then disburse the vendor's 5% share (minus platform fees).</p>
              <div className="space-y-4">
                {sellers.map(seller => {
                  const deliveredOrders = orders.filter(o => o.sellerId === seller.id && o.status === OrderStatus.DELIVERED);
                  const owed = deliveredOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
                  return (
                    <div key={seller.id} className="p-8 rounded-xl bg-[#f8f8f8] border border-slate-200 flex flex-col md:flex-row justify-between items-center group gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#131921] rounded-lg flex items-center justify-center text-[#febd69] text-2xl font-black">
                          {seller.shopName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xl">{seller.shopName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account: {seller.accountNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Owed Share</p>
                          <p className="font-black text-3xl text-emerald-600">{formatCurrency(owed)}</p>
                        </div>
                        <button 
                          disabled={owed === 0}
                          className={`px-10 py-4 rounded-md text-xs font-black shadow-lg transition transform hover:scale-105 ${owed === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#131921] text-white hover:bg-black'}`}
                        >
                          Execute Transfer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
