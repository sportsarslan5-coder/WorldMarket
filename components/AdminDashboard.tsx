
import React, { useState } from 'react';
import { Seller, Order, OrderStatus, AdminNotification } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  sellers: Seller[];
  orders: Order[];
  notifications: AdminNotification[];
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ sellers, orders, notifications, onUpdateOrders, onUpdateSellers }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers' | 'payouts' | 'notifications'>('overview');

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = orders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    onUpdateOrders(updated);
  };

  const chartData = [
    { name: 'Total Sales', value: totalSales },
    { name: 'Seller Comm.', value: totalCommission },
    { name: 'Platform Revenue', value: totalSales - totalCommission },
  ];

  const formatCurrency = (val: number) => `Rs. ${val.toLocaleString()}`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <div className="w-72 bg-slate-900 text-white flex-shrink-0 shadow-2xl">
        <div className="p-8 text-2xl font-black border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
          PK-ADMIN
        </div>
        <nav className="p-4 space-y-2 mt-4">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'orders', label: `Orders (${pendingOrders})`, icon: '📦' },
            { id: 'sellers', label: 'Vendors', icon: '🏢' },
            { id: 'payouts', label: 'Payouts', icon: '💰' },
            { id: 'notifications', label: 'Alert Center', icon: '🔔' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 font-bold ${activeTab === tab.id ? 'bg-green-600 shadow-lg text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-10">
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-800">Operational Overview</h2>
                <p className="text-slate-500 font-medium">Platform health and performance metrics</p>
              </div>
              <div className="text-sm font-bold bg-white px-4 py-2 rounded-xl shadow-sm">
                Live Status: <span className="text-green-500">Online</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Collections', value: formatCurrency(totalSales), color: 'text-green-600' },
                { label: 'Seller Commissions', value: formatCurrency(totalCommission), color: 'text-blue-600' },
                { label: 'Active Shops', value: sellers.length, color: 'text-slate-800' },
                { label: 'Pending Logistics', value: pendingOrders, color: 'text-orange-500' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 group hover:border-green-200 transition">
                  <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">{stat.label}</div>
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 h-[500px]">
              <h3 className="font-black mb-8 text-xl text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                Financial Distribution
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} tickFormatter={(val) => `Rs.${val}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : index === 1 ? '#6366f1' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800">Master Order Log</h2>
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer & Shop</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-slate-900">#{order.id}</td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-slate-800">{order.customerName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{order.sellerName} | {order.customerPhone}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-green-600">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-4 py-1.5 inline-flex text-[10px] font-black rounded-full uppercase tracking-widest 
                          ${order.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-700' : 
                            order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <select 
                          className="border border-slate-200 rounded-xl p-2.5 text-xs font-black outline-none bg-slate-50 focus:ring-2 focus:ring-green-500"
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

        {activeTab === 'sellers' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-800">Vendor Registry (PII Data)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sellers.map((seller) => (
                <div key={seller.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                    <span className="text-8xl font-black">🏢</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 leading-tight">{seller.shopName}</h4>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">/{seller.shopSlug}</p>
                      </div>
                      <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">{seller.payoutMethod}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Owner</label>
                          <p className="text-sm font-bold text-slate-700">{seller.fullName}</p>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Email</label>
                          <p className="text-sm font-bold text-slate-700">{seller.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Contact</label>
                        <p className="text-sm font-bold text-slate-700">{seller.phoneNumber}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Payout Account</label>
                        <p className="text-lg font-black text-green-600 font-mono">{seller.accountNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400 font-bold italic">
                    Joined on {new Date(seller.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-800">Alert Center (Log)</h2>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-slate-300 text-center text-slate-400 font-bold">
                  No alerts generated yet.
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-4 bg-slate-900 text-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{notif.type === 'NEW_SELLER' ? '👋' : '🛍️'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{notif.type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(notif.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-[10px] text-white">W</span> WhatsApp Payload
                        </h4>
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-sm font-medium text-green-900 italic">
                          "{notif.content.whatsapp}"
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-[10px] text-white">E</span> Email Draft
                        </h4>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-sm font-medium text-blue-900 italic whitespace-pre-line">
                          "{notif.content.email}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-slate-800">Commission Settlements</h2>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <p className="mb-10 text-slate-500 font-medium max-w-2xl">Weekly payouts for sellers. We collect 100% of the funds from customers and disburse the 5% commission once orders are marked 'Delivered'.</p>
              <div className="space-y-4">
                {sellers.map(seller => {
                  const sellerOrders = orders.filter(o => o.sellerId === seller.id && o.status === OrderStatus.DELIVERED);
                  const commissionOwed = sellerOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
                  return (
                    <div key={seller.id} className="p-8 rounded-3xl hover:bg-slate-50 transition border border-slate-100 flex justify-between items-center group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                          {seller.shopName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xl">{seller.shopName}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Account: {seller.payoutMethod} - {seller.accountNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Owed (5%)</p>
                          <p className="font-black text-3xl text-green-600">{formatCurrency(commissionOwed)}</p>
                        </div>
                        <button 
                          disabled={commissionOwed === 0}
                          className={`px-8 py-4 rounded-2xl text-sm font-black shadow-lg transition transform hover:scale-105 ${commissionOwed === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black'}`}
                        >
                          Settle Payout
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
