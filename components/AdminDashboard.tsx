
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
    const totalSales = orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
    const totalCommission = orders?.reduce((sum, o) => sum + (o.commissionAmount || 0), 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === OrderStatus.PENDING).length || 0;
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
        <div className="p-8 text-2xl font-black border-b border-slate-800">PK-ADMIN</div>
        <nav className="p-4 space-y-2 flex-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'orders', label: `Orders (${stats.pendingOrders})`, icon: '📦' },
            { id: 'sellers', label: 'Vendor PII', icon: '🛡️' },
            { id: 'payouts', label: 'Disbursements', icon: '💰' },
            { id: 'notifications', label: 'AI Alert Log', icon: '🔔' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left p-4 rounded-md flex items-center gap-3 font-bold ${activeTab === tab.id ? 'bg-emerald-600' : 'text-slate-400'}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-10">
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-800">Platform Command</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'GTV', value: formatCurrency(stats.totalSales) },
                { label: 'Owed Share', value: formatCurrency(stats.totalCommission) },
                { label: 'Vendors', value: sellers.length },
                { label: 'Pending', value: stats.pendingOrders }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-xl shadow-sm border">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2">{stat.label}</div>
                  <div className="text-3xl font-black">{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-white p-10 rounded-2xl border shadow-sm h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {sellers.map((seller) => (
              <div key={seller.id} className="bg-white p-10 rounded-2xl border shadow-sm">
                <h4 className="text-2xl font-black mb-6">{seller.shopName}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                  <div><span className="text-slate-400 block uppercase text-[10px]">Owner</span>{seller.fullName}</div>
                  <div><span className="text-slate-400 block uppercase text-[10px]">WhatsApp</span>{seller.phoneNumber}</div>
                  <div className="col-span-2 p-4 bg-emerald-50 rounded-lg text-emerald-800 font-mono">IBAN: {seller.accountNumber}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr><th className="p-8">ID</th><th className="p-8">Details</th><th className="p-8 text-right">Value</th></tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-8 font-black">#{order.id}</td>
                    <td className="p-8">
                      <div className="font-black text-sm">{order.customerName} @ {order.sellerName}</div>
                      <div className="text-xs text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="p-8 text-right font-black text-emerald-600">{formatCurrency(order.totalAmount)}</td>
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
