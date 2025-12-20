
import React, { useState, useRef } from 'react';
// Explicitly importing Link from react-router-dom to resolve module export errors
import { Link } from 'react-router-dom';
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
  const [regSuccess, setRegSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      alert("Verification Error: Valid Gmail and Payout details required for PK-MART registration.");
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
    setRegSuccess(true);
    setIsRegistering(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => prev ? ({ ...prev, imageUrl: reader.result as string }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.name || !editingProduct?.price || !currentUser) return;

    if (editingProduct.id) {
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? (editingProduct as Product) : p));
    } else {
      const newProd: Product = {
        ...(editingProduct as Omit<Product, 'id' | 'sellerId' | 'createdAt'>),
        id: 'p' + Math.random().toString(36).substr(2, 9),
        sellerId: currentUser.id,
        category: editingProduct.category || 'General',
        rating: 5.0,
        reviewsCount: 0,
        published: true,
        createdAt: new Date().toISOString(),
      } as Product;
      onUpdateProducts([...products, newProd]);
    }
    setEditingProduct(null);
  };

  // SUCCESS SCREEN
  if (regSuccess && currentUser) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] py-20 px-4 flex items-center justify-center font-sans animate-in fade-in zoom-in duration-500">
        <div className="max-w-2xl w-full p-12 bg-white rounded-lg shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">✓</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Congratulations!</h2>
          <p className="text-slate-500 font-medium text-lg mb-10 leading-relaxed">
            Your shop <b>{currentUser.shopName}</b> is now officially live on the PK-MART marketplace.
          </p>
          
          <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 mb-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Your Unique Storefront Link</p>
            <div className="text-xl font-bold text-blue-600 break-all mb-4">
              pk-mart.com/#/shop/{currentUser.shopSlug}
            </div>
            <p className="text-xs text-slate-400">Share this link with your customers on WhatsApp and Social Media.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <a 
              href={`#/shop/${currentUser.shopSlug}`} 
              target="_blank" 
              className="flex-1 py-5 bg-[#131921] text-white rounded-md font-black text-lg shadow-xl hover:bg-black transition"
            >
              Visit My Store
            </a>
            <button 
              onClick={() => setRegSuccess(false)} 
              className="flex-1 py-5 bg-[#febd69] text-[#131921] rounded-md font-black text-lg shadow-xl hover:bg-[#f3a847] transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] py-20 px-4 flex items-center justify-center font-sans">
        <div className="max-w-2xl w-full p-12 bg-white rounded-lg shadow-xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Sell on PK-MART</h1>
            <p className="text-slate-500 font-medium">Join thousands of Pakistani entrepreneurs reaching customers nationwide.</p>
          </div>
          
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personal & Gmail Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1">Full Legal Name</label>
                  <input 
                    type="text" placeholder="John Doe" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                    value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1">Gmail Address</label>
                  <input 
                    type="email" placeholder="user@gmail.com" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                    value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1">WhatsApp Number</label>
                <input 
                  type="text" placeholder="03001234567" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                  value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Shop Identity</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1">Business Name</label>
                <input 
                  type="text" placeholder="e.g. Salman Sports" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                  value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
                />
              </div>
            </section>
            
            <section className="space-y-4 p-6 bg-[#232f3e] rounded-lg text-white">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#febd69]">Payout Logistics (Hidden)</h3>
              <p className="text-[10px] opacity-70 mb-4">Admin will use these details to disburse your weekly earnings.</p>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold opacity-60">Payout Method</label>
                  <select 
                    className="w-full bg-slate-800 rounded-md p-3 font-bold outline-none border border-slate-700"
                    value={regData.payoutMethod} onChange={e => setRegData({...regData, payoutMethod: e.target.value as SellerPayoutMethod})}
                  >
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="flex-[2] space-y-1">
                  <label className="text-[10px] font-bold opacity-60">Account Number / IBAN</label>
                  <input 
                    type="text" placeholder="Enter number..." className="w-full bg-slate-800 rounded-md p-3 font-mono outline-none border border-slate-700" 
                    value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <button 
              onClick={handleRegister}
              className="w-full py-5 rounded-md bg-[#febd69] text-[#131921] font-black text-lg shadow-lg hover:bg-[#f3a847] transition transform active:scale-[0.98]"
            >
              Verify & Start Selling
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f3f3] font-sans">
      <div className="w-full lg:w-72 bg-[#131921] text-white p-8 flex flex-col shadow-2xl z-40">
        <div className="mb-12">
          <Link to="/" className="text-2xl font-black text-white px-2 mb-2 block">
            PK<span className="text-[#febd69]">-</span>MART
          </Link>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Seller Central</div>
        </div>

        <div className="mb-8 space-y-2">
          <a 
            href={`#/shop/${currentUser?.shopSlug}`} 
            target="_blank" 
            className="w-full flex items-center justify-between p-4 bg-[#febd69]/10 border border-[#febd69]/30 rounded-lg group hover:bg-[#febd69]/20 transition"
          >
            <div>
              <p className="text-[10px] font-black text-[#febd69] uppercase mb-1">Storefront Live</p>
              <p className="text-xs font-bold text-white group-hover:underline">Visit Store →</p>
            </div>
          </a>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'products', label: 'Inventory', icon: '📦' },
            { id: 'orders', label: 'Order Log', icon: '📝' },
            { id: 'profile', label: 'My Identity', icon: '👤' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left p-4 rounded-md font-bold transition flex items-center gap-3 ${activeTab === tab.id ? 'bg-slate-800 text-[#febd69]' : 'text-slate-400 hover:bg-slate-800/50'}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <button onClick={() => setCurrentUser(null)} className="w-full py-3 bg-red-900/20 text-red-400 rounded-md text-xs font-black border border-red-900/30 hover:bg-red-900/40 transition">Logout</button>
        </div>
      </div>

      <div className="flex-1 p-8 lg:p-16 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
           <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">{currentUser?.shopName}</h1>
             <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Verified Vendor Account</p>
           </div>
           {activeTab === 'products' && (
             <button onClick={() => setEditingProduct({})} className="bg-[#febd69] text-[#131921] px-8 py-3 rounded-md font-black shadow-md hover:bg-[#f3a847] transition transform active:scale-95 flex items-center gap-2">
               <span>+</span> Add New Product
             </button>
           )}
        </header>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {sellerProducts.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                <div className="text-6xl mb-6 opacity-20 text-slate-400">🛍️</div>
                <p className="text-slate-400 font-black">Ready to sell? Add your first product to get started.</p>
              </div>
            ) : (
              sellerProducts.map(p => (
                <div key={p.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group">
                  <div className="h-56 bg-[#f8f8f8] p-4 relative overflow-hidden flex items-center justify-center">
                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                    <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-1 rounded-full font-black text-slate-900 text-xs shadow-sm">Rs. {p.price.toLocaleString()}</div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{p.category}</span>
                      <div className="flex items-center text-yellow-500 text-[10px] font-black">
                        ⭐ {p.rating}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 truncate">{p.name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">{p.description}</p>
                    <button onClick={() => setEditingProduct(p)} className="w-full py-3 border border-slate-200 rounded-md text-xs font-black text-slate-600 hover:bg-slate-50 transition">Edit Listing</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Orders and Profile Tabs remain functional and robust */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Value</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Dispatch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerOrders.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold italic">No active orders found.</td></tr>
                ) : (
                  sellerOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-8 font-black text-slate-900">#{o.id}</td>
                      <td className="p-8">
                        <p className="font-bold text-slate-800 text-sm">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{o.customerPhone}</p>
                      </td>
                      <td className="p-8 text-right font-black text-green-600">Rs. {o.totalAmount.toLocaleString()}</td>
                      <td className="p-8 text-right">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${o.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
             <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-xl font-black mb-8 border-b pb-4 text-slate-900">Official Verification Profile</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Legal Vendor Name</label>
                     <p className="font-black text-slate-800">{currentUser?.fullName}</p>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">WhatsApp Connect</label>
                     <p className="font-black text-slate-800">{currentUser?.phoneNumber}</p>
                   </div>
                 </div>
                 <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Gmail Identity</label>
                     <p className="font-black text-slate-800 underline">{currentUser?.email}</p>
                   </div>
                   <div className="p-6 bg-slate-900 rounded-lg text-white">
                     <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Central Disbursement IBAN</label>
                     <p className="font-mono text-sm font-bold text-[#febd69] tracking-widest">{currentUser?.accountNumber}</p>
                     <p className="text-[9px] font-black text-slate-500 mt-2 uppercase tracking-tighter">PROVIDER: {currentUser?.payoutMethod}</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-[#131921]/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-auto">
              <header className="flex justify-between items-center mb-8 border-b pb-6">
                <h2 className="text-2xl font-black text-slate-900">{editingProduct.id ? 'Edit Product' : 'Add New Listing'}</h2>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-red-500 text-2xl font-black">×</button>
              </header>

              <div className="space-y-8">
                {/* IMAGE UPLOAD SECTION */}
                <section>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 tracking-widest">Product Gallery</label>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-48 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                      {editingProduct.imageUrl ? (
                        <img src={editingProduct.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                      ) : (
                        <span className="text-slate-300 text-4xl">🖼️</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <p className="text-sm font-medium text-slate-500">Upload high-quality JPG or PNG images from your device gallery. 1:1 aspect ratio recommended.</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-xs hover:bg-black transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        📁 Choose from Gallery
                      </button>
                      <input 
                        type="text" 
                        placeholder="...or paste image URL" 
                        className="w-full p-4 rounded-lg border bg-slate-50 text-xs font-bold outline-none"
                        value={editingProduct.imageUrl || ''}
                        onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Title</label>
                    <input 
                      type="text" className="w-full p-4 rounded-lg border font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                      value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Price (PKR)</label>
                    <input 
                      type="number" className="w-full p-4 rounded-lg border font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                      value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    />
                  </div>
                </section>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
                  <select 
                    className="w-full p-4 rounded-lg border font-bold outline-none bg-slate-50"
                    value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Sports">Sports</option>
                    <option value="Home">Home</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Product Description</label>
                  <textarea 
                    className="w-full p-4 rounded-lg border font-bold outline-none h-32 leading-relaxed" 
                    value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 bg-slate-50 rounded-lg font-black text-slate-400 hover:bg-slate-100 transition">Discard</button>
                <button onClick={handleSaveProduct} className="flex-1 py-4 bg-[#febd69] text-[#131921] rounded-lg font-black shadow-xl hover:bg-[#f3a847] transition">Publish to Marketplace</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
