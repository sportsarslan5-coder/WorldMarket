
import React, { useState, useMemo } from 'react';
// Added missing Link import from react-router-dom
import { Link } from 'react-router-dom';
import { Seller, Order, OrderStatus, AdminNotification } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sellers'>('overview');

  const stats = useMemo(() => {
    const totalGTV = orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
    // As requested: 95% for Admin, 5% for Seller
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
      <div className="w-64 bg-[#131921] text-white p-8 flex flex-col">
        <h2 className="text-2xl font-black mb-10">PK-ADMIN</h2>
        <nav className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left font-bold ${activeTab === 'overview' ? 'text-[#febd69]' : 'text-slate-400'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left font-bold ${activeTab === 'orders' ? 'text-[#febd69]' : 'text-slate-400'}`}>Recent Orders</button>
          <button onClick={() => setActiveTab('sellers')} className={`w-full text-left font-bold ${activeTab === 'sellers' ? 'text-[#febd69]' : 'text-slate-400'}`}>Vendor PII</button>
        </nav>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <h1 className="text-4xl font-black text-slate-900">Platform Finance</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Collections</p>
                <p className="text-3xl font-black">Rs. {stats.totalGTV.toLocaleString()}</p>
              </div>
              <div className="bg-[#232f3e] p-8 rounded-2xl border shadow-sm text-white">
                <p className="text-[10px] font-black text-[#febd69] uppercase">Admin Net (95%)</p>
                <p className="text-3xl font-black text-emerald-400">Rs. {stats.adminShare.toLocaleString()}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase">Vendor Payable (5%)</p>
                <p className="text-3xl font-black text-orange-500">Rs. {stats.sellerShare.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-2xl border h-96">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sellers.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-2xl border shadow-sm">
                <h3 className="text-xl font-black mb-4">{s.shopName}</h3>
                <div className="space-y-2 text-sm">
                  <p><b>Owner:</b> {s.fullName}</p>
                  <p><b>Account:</b> {s.accountNumber} ({s.payoutMethod})</p>
                  <p><b>Phone:</b> {s.phoneNumber}</p>
                </div>
                {/* Link is now correctly defined after import */}
                <Link to={`/shop/${s.shopSlug}`} target="_blank" className="mt-6 block text-center py-2 bg-slate-100 rounded-lg text-xs font-black">View Storefront</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr><th className="p-6">ID</th><th className="p-6">Store</th><th className="p-6">Customer</th><th className="p-6 text-right">Value</th></tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="p-6 font-black">#{o.id}</td>
                    <td className="p-6 font-bold">{o.sellerName}</td>
                    <td className="p-6 text-sm">{o.customerName}<br/><span className="text-[10px] text-slate-400">{o.customerPhone}</span></td>
                    <td className="p-6 text-right font-black text-emerald-600">Rs. {o.totalAmount.toLocaleString()}</td>
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
