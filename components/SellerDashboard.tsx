
import React, { useState } from 'react';
import { Seller, Product, Order, OrderStatus } from '../types';

interface SellerDashboardProps {
  currentUser: Seller | null;
  setCurrentUser: (seller: Seller | null) => void;
  sellers: Seller[];
  products: Product[];
  orders: Order[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
  currentUser, setCurrentUser, sellers, products, orders, onUpdateProducts, onUpdateSellers 
}) => {
  const [isRegistering, setIsRegistering] = useState(!currentUser);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  
  // Registration Form State
  const [regData, setRegData] = useState({
    fullName: '',
    phoneNumber: '',
    shopName: '',
    country: '',
    paymentType: 'PayPal' as const,
    accountDetails: ''
  });

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Global Merchant</h2>
          <p className="text-gray-500 mb-8 font-medium">Join our international commerce community.</p>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Full Legal Name</label>
              <input 
                type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-blue-500 border transition" 
                value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Country</label>
                <input 
                  type="text" placeholder="e.g. USA, UK, Japan" className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-blue-500 border transition" 
                  value={regData.country} onChange={e => setRegData({...regData, country: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Phone (Intl format)</label>
                <input 
                  type="text" placeholder="+1 ..." className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-blue-500 border transition" 
                  value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Shop Name</label>
              <input 
                type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-blue-500 border transition" 
                value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Payout Method</label>
              <select 
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-blue-500 border transition appearance-none"
                value={regData.paymentType} onChange={e => setRegData({...regData, paymentType: e.target.value as any})}
              >
                <option value="PayPal">PayPal</option>
                <option value="Stripe">Stripe Connect</option>
                <option value="Bank Transfer">International Bank (Swift)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account / IBAN / Email</label>
              <input 
                type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-blue-500 border transition" 
                value={regData.accountDetails} onChange={e => setRegData({...regData, accountDetails: e.target.value})}
              />
            </div>
            <button 
              onClick={() => {
                const newSeller: Seller = {
                  id: 's' + Math.random().toString(36).substr(2, 9),
                  fullName: regData.fullName,
                  email: 'merchant@worldmarket.com',
                  phoneNumber: regData.phoneNumber,
                  country: regData.country,
                  paymentType: regData.paymentType,
                  accountDetails: regData.accountDetails,
                  shopName: regData.shopName,
                  shopSlug: regData.shopName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  joinedAt: new Date().toISOString()
                };
                setCurrentUser(newSeller);
                onUpdateSellers([...sellers, newSeller]);
                setIsRegistering(false);
              }}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 transition transform hover:scale-[1.02]"
            >
              Launch My Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sellerProducts = products.filter(p => p.sellerId === currentUser?.id);
  const sellerOrders = orders.filter(o => o.sellerId === currentUser?.id);
  const totalCommission = sellerOrders
    .filter(o => o.status === OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.commissionAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b px-10 py-5 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
            {currentUser?.shopName.charAt(0)}
          </div>
          <div>
            <h1 className="font-black text-xl text-slate-900 leading-none">{currentUser?.shopName}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">/shop/{currentUser?.shopSlug}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <a href={`#/shop/${currentUser?.shopSlug}`} className="text-sm font-bold bg-slate-50 px-6 py-2 rounded-xl hover:bg-slate-100 transition">Visit Shopfront</a>
          <button onClick={() => setCurrentUser(null)} className="text-sm font-bold text-red-500 px-2">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-10 grid grid-cols-12 gap-10">
        {/* Stats Row */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Global Catalog</h3>
            <p className="text-4xl font-black text-slate-800">{sellerProducts.length}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Sales Fulfilled</h3>
            <p className="text-4xl font-black text-slate-800">{sellerOrders.filter(o => o.status === OrderStatus.DELIVERED).length}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100 bg-blue-50/50">
            <h3 className="text-blue-600 text-xs font-black uppercase tracking-widest mb-1">Your 5% Profit</h3>
            <p className="text-4xl font-black text-blue-600">${totalCommission.toLocaleString()}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border p-3 space-y-1">
            <button onClick={() => setActiveTab('products')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}>Inventory</button>
            <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}>World Orders</button>
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}>Merchant Config</button>
          </div>
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-9">
          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Product Inventory</h2>
                <button 
                  onClick={() => {
                    const newProd: Product = {
                      id: 'p' + Math.random().toString(36).substr(2, 9),
                      sellerId: currentUser!.id,
                      name: 'Sample Global Item',
                      description: 'Enter worldwide product description...',
                      price: 99,
                      currency: 'USD',
                      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
                      published: true,
                      createdAt: new Date().toISOString()
                    };
                    onUpdateProducts([...products, newProd]);
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-md transition"
                >
                  List New Product
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sellerProducts.map(product => (
                  <div key={product.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="h-56 overflow-hidden">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    </div>
                    <div className="p-6">
                      <h4 className="font-black text-xl mb-1 text-slate-800">{product.name}</h4>
                      <p className="text-blue-600 font-black text-lg mb-4">${product.price}</p>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-slate-50 py-3 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 uppercase tracking-widest">Update</button>
                        <button className="bg-red-50 p-3 rounded-xl text-red-600 hover:bg-red-100">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Worldwide Referral Orders</h2>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Earn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {sellerOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-800">{order.id}</td>
                        <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                          {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-[10px] font-black px-3 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-widest">{order.status}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-blue-600">
                          ${order.commissionAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {sellerOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium italic">Your shop is ready for global traffic. Share your link!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Merchant Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Store Front</p>
                  <p className="font-black text-xl text-slate-800">{currentUser?.shopName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Origin Country</p>
                  <p className="font-black text-xl text-slate-800">{currentUser?.country}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Disbursement</p>
                  <p className="font-black text-xl text-slate-800">{currentUser?.paymentType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Wallet/Bank Info</p>
                  <p className="font-mono text-xs text-blue-600 font-bold break-all">{currentUser?.accountDetails}</p>
                </div>
              </div>
              <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-900 text-sm font-medium">
                Note: WorldMarket aggregates global payments and manages international customs. Payouts are reconciled every Friday at 00:00 GMT for all Delivered orders.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
