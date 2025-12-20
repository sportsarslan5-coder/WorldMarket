
import React, { useState } from 'react';
import { Seller, Product, Order, OrderStatus, SellerPayoutMethod } from '../types.ts';

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
  
  const [regData, setRegData] = useState({
    fullName: '',
    phoneNumber: '',
    shopName: '',
    payoutMethod: 'JazzCash' as SellerPayoutMethod,
    accountNumber: ''
  });

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-green-50 py-12 px-4">
        <div className="max-w-xl mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-green-100">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Sell in Pakistan</h2>
          <p className="text-gray-500 mb-8 font-medium">Create your shop and receive 5% commission on every sale.</p>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
              <input 
                type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</label>
              <input 
                type="text" placeholder="03xxxxxxxxx" className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Shop Name</label>
              <input 
                type="text" className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Payout Method (For Commission)</label>
              <select 
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-green-500 border transition appearance-none"
                value={regData.payoutMethod} onChange={e => setRegData({...regData, payoutMethod: e.target.value as SellerPayoutMethod})}
              >
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{regData.payoutMethod} Number / Account</label>
              <input 
                type="text" placeholder={`Enter ${regData.payoutMethod} details`} className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 font-medium outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})}
              />
            </div>
            <button 
              onClick={() => {
                if(!regData.fullName || !regData.shopName || !regData.accountNumber) {
                  alert("Please fill all fields");
                  return;
                }
                const newSeller: Seller = {
                  id: 's' + Math.random().toString(36).substr(2, 9),
                  fullName: regData.fullName,
                  email: 'seller@pkmart.com',
                  phoneNumber: regData.phoneNumber,
                  payoutMethod: regData.payoutMethod,
                  accountNumber: regData.accountNumber,
                  shopName: regData.shopName,
                  shopSlug: regData.shopName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  joinedAt: new Date().toISOString()
                };
                setCurrentUser(newSeller);
                onUpdateSellers([...sellers, newSeller]);
                setIsRegistering(false);
              }}
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-green-700 transition transform hover:scale-[1.02]"
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
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
            {currentUser?.shopName.charAt(0)}
          </div>
          <div>
            <h1 className="font-black text-xl text-slate-900 leading-none">{currentUser?.shopName}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">/shop/{currentUser?.shopSlug}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <a href={`#/shop/${currentUser?.shopSlug}`} target="_blank" className="text-sm font-bold bg-slate-50 px-6 py-2 rounded-xl hover:bg-slate-100 transition">Visit My Shop</a>
          <button onClick={() => setCurrentUser(null)} className="text-sm font-bold text-red-500 px-2">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-10 grid grid-cols-12 gap-10">
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Products</h3>
            <p className="text-4xl font-black text-slate-800">{sellerProducts.length}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Sales</h3>
            <p className="text-4xl font-black text-slate-800">{sellerOrders.length}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 bg-green-50/50">
            <h3 className="text-green-600 text-xs font-black uppercase tracking-widest mb-1">Commission Earned (5%)</h3>
            <p className="text-4xl font-black text-green-600">Rs. {totalCommission.toLocaleString()}</p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border p-3 space-y-1">
            <button onClick={() => setActiveTab('products')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition ${activeTab === 'products' ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}>Inventory</button>
            <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition ${activeTab === 'orders' ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}>Orders</button>
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition ${activeTab === 'profile' ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}>Account Settings</button>
          </div>
        </div>

        <div className="col-span-12 md:col-span-9">
          {activeTab === 'products' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Inventory</h2>
                <button 
                  onClick={() => {
                    const newProd: Product = {
                      id: 'p' + Math.random().toString(36).substr(2, 9),
                      sellerId: currentUser!.id,
                      name: 'New Product Name',
                      description: 'Enter details here...',
                      price: 1000,
                      currency: 'PKR',
                      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
                      published: true,
                      createdAt: new Date().toISOString()
                    };
                    onUpdateProducts([...products, newProd]);
                  }}
                  className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 shadow-md transition"
                >
                  + Add Product
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
                      <p className="text-green-600 font-black text-lg mb-4">Rs. {product.price}</p>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-slate-50 py-3 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 uppercase tracking-widest">Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Orders</h2>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {sellerOrders.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-800">{order.id}</td>
                        <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                          {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-green-600">
                          Rs. {order.commissionAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Payout Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shop Name</p>
                  <p className="font-black text-xl text-slate-800">{currentUser?.shopName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payout Method</p>
                  <p className="font-black text-xl text-slate-800">{currentUser?.payoutMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Number</p>
                  <p className="font-black text-xl text-green-600">{currentUser?.accountNumber}</p>
                </div>
              </div>
              <div className="mt-12 p-6 bg-green-50/50 rounded-2xl border border-green-100 text-green-900 text-sm font-medium">
                Note: Payments are collected by the platform admin. Your 5% commission is transferred to your {currentUser?.payoutMethod} account weekly upon delivery of items.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
