
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
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    shopName: '',
    payoutMethod: 'JazzCash' as SellerPayoutMethod,
    accountNumber: '',
    bankName: ''
  });

  const sellerProducts = products.filter(p => p.sellerId === currentUser?.id);
  const sellerOrders = orders.filter(o => o.sellerId === currentUser?.id);

  const handleRegister = () => {
    if(!regData.fullName || !regData.shopName || !regData.accountNumber || !regData.email) {
      alert("Please fill all mandatory fields (Name, Email, Shop, and Payout Account)");
      return;
    }
    
    const newSeller: Seller = {
      id: 's' + Math.random().toString(36).substr(2, 9),
      fullName: regData.fullName,
      email: regData.email,
      phoneNumber: regData.phoneNumber,
      payoutMethod: regData.payoutMethod,
      accountNumber: regData.accountNumber,
      bankName: regData.bankName,
      shopName: regData.shopName,
      shopSlug: regData.shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      joinedAt: new Date().toISOString()
    };

    onUpdateSellers([...sellers, newSeller]);
    setCurrentUser(newSeller);
    setIsRegistering(false);
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.name || !editingProduct?.price || !currentUser) return;

    if (editingProduct.id) {
      // Edit existing
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? (editingProduct as Product) : p));
    } else {
      // Add new
      const newProd: Product = {
        ...(editingProduct as Omit<Product, 'id' | 'sellerId' | 'createdAt'>),
        id: 'p' + Math.random().toString(36).substr(2, 9),
        sellerId: currentUser.id,
        published: true,
        currency: 'PKR',
        createdAt: new Date().toISOString(),
      } as Product;
      onUpdateProducts([...products, newProd]);
    }
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full p-12 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100">
          <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Vendor Portal</h2>
          <p className="text-slate-500 mb-10 font-medium text-lg">Join Pakistan's fastest growing multi-vendor network.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" placeholder="As per CNIC" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Gmail Address</label>
              <input 
                type="email" placeholder="example@gmail.com" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
              <input 
                type="text" placeholder="03XXXXXXXXX" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Name</label>
              <input 
                type="text" placeholder="e.g. Lahore Fashion Hub" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition" 
                value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] space-y-6 shadow-xl mb-10">
            <h3 className="text-white font-black text-xl mb-2 flex items-center gap-2">
              <span className="text-green-500 text-2xl">💰</span> Payout Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Provider</label>
                <select 
                  className="w-full rounded-xl bg-slate-800 text-white p-4 font-black outline-none border border-slate-700 focus:border-green-500"
                  value={regData.payoutMethod} onChange={e => setRegData({...regData, payoutMethod: e.target.value as SellerPayoutMethod})}
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Account / Mobile #</label>
                <input 
                  type="text" placeholder="Digits only" className="w-full rounded-xl bg-slate-800 text-white p-4 font-bold outline-none border border-slate-700" 
                  value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})}
                />
              </div>
            </div>
            
            {regData.payoutMethod === 'Bank Transfer' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Bank Name</label>
                <input 
                  type="text" placeholder="e.g. Bank Alfalah" className="w-full rounded-xl bg-slate-800 text-white p-4 font-bold outline-none border border-slate-700" 
                  value={regData.bankName} onChange={e => setRegData({...regData, bankName: e.target.value})}
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleRegister}
            className="w-full py-6 rounded-[2rem] bg-green-600 text-white font-black text-xl shadow-2xl shadow-green-200 hover:bg-green-700 transition transform hover:-translate-y-1"
          >
            Launch My Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 p-8 flex flex-col">
        <div className="mb-12">
          <div className="text-3xl font-black text-green-700 mb-1">PK-MART</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Seller Control</div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'products', label: 'Inventory', icon: '📦' },
            { id: 'orders', label: 'Orders', icon: '🛍️' },
            { id: 'profile', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="p-4 bg-green-50 rounded-2xl">
            <p className="text-[10px] font-black text-green-700 uppercase mb-1">Store URL</p>
            <p className="text-xs font-bold text-slate-800 break-all cursor-pointer hover:underline" onClick={() => window.open(`#/shop/${currentUser?.shopSlug}`, '_blank')}>
              /shop/{currentUser?.shopSlug}
            </p>
          </div>
          <button 
            onClick={() => setCurrentUser(null)} 
            className="w-full mt-4 text-xs font-black text-slate-400 hover:text-red-500 py-2"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-16 overflow-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900">{currentUser?.shopName}</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your business operations</p>
          </div>
          {activeTab === 'products' && (
            <button 
              onClick={() => setEditingProduct({ name: '', description: '', price: 0, imageUrl: '' })}
              className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <span>+</span> New Product
            </button>
          )}
        </header>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {sellerProducts.length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-black text-xl mb-4">No products listed yet.</p>
                <button onClick={() => setEditingProduct({})} className="text-green-600 font-bold">Start adding now</button>
              </div>
            ) : (
              sellerProducts.map(product => (
                <div key={product.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group">
                  <div className="h-52 relative overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur px-4 py-1.5 rounded-full text-white text-xs font-black">
                      Rs. {product.price}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{product.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">{product.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingProduct(product)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-900 font-black text-xs hover:bg-slate-200">Edit</button>
                      <button onClick={() => deleteProduct(product.id)} className="px-4 py-3 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sellerOrders.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-black">No orders found</td></tr>
                  ) : (
                    sellerOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="p-8 font-black text-slate-900">#{order.id}</td>
                        <td className="p-8">
                          <p className="font-bold text-slate-800">{order.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-black">{order.customerPhone}</p>
                        </td>
                        <td className="p-8 font-black text-green-600">Rs. {order.totalAmount}</td>
                        <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-3xl space-y-8">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Payout Strategy</h3>
              <div className="space-y-6">
                <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Current Method</span>
                    <span className="bg-green-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">Active</span>
                  </div>
                  <div className="text-3xl font-black text-green-900">{currentUser?.payoutMethod}</div>
                  <div className="mt-2 font-mono text-xl font-black text-green-700">{currentUser?.accountNumber}</div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Support & Payout Rules</h4>
                  <ul className="space-y-3">
                    <li className="text-sm font-bold text-slate-600 flex items-start gap-3">
                      <span className="text-green-500">•</span> Payouts processed every Tuesday for delivered orders.
                    </li>
                    <li className="text-sm font-bold text-slate-600 flex items-start gap-3">
                      <span className="text-green-500">•</span> A standard 5% marketing fee is deducted from total sales.
                    </li>
                    <li className="text-sm font-bold text-slate-600 flex items-start gap-3">
                      <span className="text-green-500">•</span> Admin handles all packing and logistics.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white max-w-lg w-full rounded-[3.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10">
              <h2 className="text-3xl font-black text-slate-900 mb-8">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                  <input 
                    type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition" 
                    value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (PKR)</label>
                    <input 
                      type="number" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition" 
                      value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</label>
                    <div className="p-4 bg-slate-100 rounded-2xl font-black text-slate-400 text-sm">PKR</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL</label>
                  <input 
                    type="text" placeholder="https://unsplash.com/..." className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition" 
                    value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-green-500 border transition h-32" 
                    value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProduct}
                  className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-black text-sm shadow-xl hover:bg-green-700 transition"
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
