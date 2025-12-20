
import React, { useState } from 'react';
import { Seller, Order, OrderStatus } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  sellers: Seller[];
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ sellers, orders, onUpdateOrders, onUpdateSellers }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers' | 'payouts'>('overview');

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div className="w-64 bg-green-900 text-white flex-shrink-0">
        <div className="p-6 text-2xl font-black border-b border-green-800 tracking-tight">PK-MART ADMIN</div>
        <nav className="p-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-green-600 shadow-lg' : 'hover:bg-green-800'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-green-600 shadow-lg' : 'hover:bg-green-800'}`}>Orders ({pendingOrders})</button>
          <button onClick={() => setActiveTab('sellers')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'sellers' ? 'bg-green-600 shadow-lg' : 'hover:bg-green-800'}`}>Sellers</button>
          <button onClick={() => setActiveTab('payouts')} className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'payouts' ? 'bg-green-600 shadow-lg' : 'hover:bg-green-800'}`}>Seller Payouts</button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-slate-800">Platform Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border">
                <div className="text-gray-400 font-bold uppercase text-xs mb-1">Total Collections</div>
                <div className="text-3xl font-black text-green-600">{formatCurrency(totalSales)}</div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border">
                <div className="text-gray-400 font-bold uppercase text-xs mb-1">Active Sellers</div>
                <div className="text-3xl font-black text-slate-800">{sellers.length}</div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border">
                <div className="text-gray-400 font-bold uppercase text-xs mb-1">Pending Orders</div>
                <div className="text-3xl font-black text-orange-500">{pendingOrders}</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border h-[450px]">
              <h3 className="font-bold mb-6 text-xl text-slate-700">Financial Insights</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val}`} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#059669' : index === 1 ? '#6366f1' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800">Recent Orders</h2>
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Customer Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{order.customerName}</div>
                        <div className="text-xs text-gray-400">{order.customerPhone} | {order.customerAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                          ${order.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-700' : 
                            order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select 
                          className="border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none"
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
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800">Vendor Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sellers.map((seller) => (
                <div key={seller.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-black text-slate-800">{seller.shopName}</h4>
                      <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">{seller.payoutMethod}</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm">Owner: {seller.fullName}</p>
                    <p className="text-gray-500 font-medium text-sm">Phone: {seller.phoneNumber}</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-xs font-mono font-bold text-green-600">{seller.payoutMethod}: {seller.accountNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800">Seller Commission Payouts</h2>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p className="mb-8 text-gray-500 font-medium">Clear 5% referral commissions for completed orders.</p>
              <div className="space-y-2">
                {sellers.map(seller => {
                  const sellerOrders = orders.filter(o => o.sellerId === seller.id && o.status === OrderStatus.DELIVERED);
                  const commissionOwed = sellerOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
                  return (
                    <div key={seller.id} className="p-6 rounded-2xl hover:bg-slate-50 transition border flex justify-between items-center">
                      <div>
                        <p className="font-black text-slate-800 text-lg">{seller.shopName}</p>
                        <p className="text-xs text-gray-400 font-bold">{seller.payoutMethod} Account: {seller.accountNumber}</p>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-black">Commission Owed</p>
                          <p className="font-black text-2xl text-green-600">{formatCurrency(commissionOwed)}</p>
                        </div>
                        <button className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 shadow-md">Mark Paid</button>
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
