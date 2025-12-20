
import React, { useState, useRef } from 'react';
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

const ADMIN_WHATSAPP = "923079490721";

const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
  currentUser, setCurrentUser, sellers = [], products = [], orders = [], onUpdateProducts, onUpdateSellers 
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

  const sellerProducts = products?.filter(p => p.sellerId === currentUser?.id) || [];
  const sellerOrders = orders?.filter(o => o.sellerId === currentUser?.id) || [];

  const handleRegister = () => {
    if(!regData.fullName || !regData.shopName || !regData.accountNumber || !regData.email) {
      alert("Verification Error: Valid Gmail and Payout details required for PK-MART registration.");
      return;
    }
    
    const shopSlug = regData.shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      id: 's' + Math.random().toString(36).substr(2, 9),
      fullName: regData.fullName,
      email: regData.email,
      phoneNumber: regData.phoneNumber,
      payoutMethod: regData.payoutMethod,
      accountNumber: regData.accountNumber,
      bankName: regData.bankName,
      shopName: regData.shopName,
      shopSlug: shopSlug,
      joinedAt: new Date().toISOString()
    };

    // Construct WhatsApp Message for Admin
    const shopUrl = `${window.location.origin}/#/shop/${shopSlug}`;
    const message = `Hi Admin, I want to register as a Vendor on PK-MART.%0A%0A` +
                    `*Vendor Details:*%0A` +
                    `- Name: ${newSeller.fullName}%0A` +
                    `- Email: ${newSeller.email}%0A` +
                    `- WhatsApp: ${newSeller.phoneNumber}%0A%0A` +
                    `*Shop Info:*%0A` +
                    `- Shop Name: ${newSeller.shopName}%0A` +
                    `- Payout: ${newSeller.payoutMethod} (${newSeller.accountNumber})%0A%0A` +
                    `*Review Shop Link:* ${shopUrl}`;

    onUpdateSellers([...sellers, newSeller]);
    setCurrentUser(newSeller);
    setRegSuccess(true);
    setIsRegistering(false);

    // Open WhatsApp to notify Admin
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
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

  if (regSuccess && currentUser) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] py-20 px-4 flex items-center justify-center font-sans animate-in fade-in zoom-in duration-500">
        <div className="max-w-2xl w-full p-12 bg-white rounded-lg shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">✓</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Registration Submitted!</h2>
          <p className="text-slate-500 font-medium text-lg mb-10 leading-relaxed">
            Your registration details for <b>{currentUser.shopName}</b> have been sent to the Admin via WhatsApp for final approval.
          </p>
          
          <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 mb-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Your Live Storefront Link</p>
            <div className="text-xl font-bold text-blue-600 break-all mb-4">
              {window.location.origin}/#/shop/{currentUser.shopSlug}
            </div>
            <p className="text-xs text-slate-400 italic">Click "Visit My Store" below to see your website in action.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Link 
              to={`/shop/${currentUser.shopSlug}`} 
              target="_blank" 
              className="flex-1 py-5 bg-[#131921] text-white rounded-md font-black text-lg shadow-xl hover:bg-black transition text-center"
            >
              Visit My Store
            </Link>
            <button 
              onClick={() => setRegSuccess(false)} 
              className="flex-1 py-5 bg-[#febd69] text-[#131921] rounded-md font-black text-lg shadow-xl hover:bg-[#f3a847] transition"
            >
              Seller Dashboard
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
            <p className="text-slate-500 font-medium">PK-MART is Pakistan's only direct-to-admin vendor marketplace.</p>
          </div>
          
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Owner Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1">Full Name</label>
                  <input 
                    type="text" placeholder="Your Name" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                    value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1">Gmail Account</label>
                  <input 
                    type="email" placeholder="example@gmail.com" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                    value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1">WhatsApp Mobile Number</label>
                <input 
                  type="text" placeholder="03XXXXXXXXX" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                  value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Business Setup</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1">Shop Name</label>
                <input 
                  type="text" placeholder="e.g. Fine Electronics" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                  value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
                />
              </div>
            </section>
            
            <section className="space-y-4 p-6 bg-[#232f3e] rounded-lg text-white">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#febd69]">Disbursement Settings</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold opacity-60">Provider</label>
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
                  <label className="text-[10px] font-bold opacity-60">Account Number</label>
                  <input 
                    type="text" placeholder="03XXXXXXXXX or IBAN" className="w-full bg-slate-800 rounded-md p-3 font-mono outline-none border border-slate-700" 
                    value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <button 
              onClick={handleRegister}
              className="w-full py-5 rounded-md bg-[#25D366] text-white font-black text-lg shadow-lg hover:bg-[#128C7E] transition transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.747-2.874-2.512-2.96-2.626-.087-.115-.708-.943-.708-1.799 0-.856.448-1.277.607-1.441.159-.164.346-.205.462-.205.115 0 .231.001.332.006.107.005.25-.04.391.297.145.347.491 1.201.535 1.287.043.087.072.188.014.304-.058.115-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.088.275.073.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086.158.058 1.011.477 1.184.564.174.087.289.13.332.202.045.072.045.419-.1.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.957-1.302C8.369 21.503 10.113 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.724 0-3.32-.426-4.722-1.174l-.339-.18-2.553.67.683-2.491-.198-.328A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
              Verify & Register via WhatsApp
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
          <Link 
            to={`/shop/${currentUser?.shopSlug}`} 
            target="_blank" 
            className="w-full flex items-center justify-between p-4 bg-[#febd69]/10 border border-[#febd69]/30 rounded-lg group hover:bg-[#febd69]/20 transition"
          >
            <div>
              <p className="text-[10px] font-black text-[#febd69] uppercase mb-1">Live Storefront</p>
              <p className="text-xs font-bold text-white group-hover:underline">Visit Store →</p>
            </div>
          </Link>
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
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">{currentUser?.shopName || "My Shop"}</h1>
             <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Verified Vendor Portal</p>
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
                <p className="text-slate-400 font-black">List your first product for your Pakistani customers.</p>
              </div>
            ) : (
              sellerProducts.map(p => (
                <div key={p.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group">
                  <div className="h-56 bg-[#f8f8f8] p-4 relative overflow-hidden flex items-center justify-center">
                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                    <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-1 rounded-full font-black text-slate-900 text-xs shadow-sm">Rs. {p.price?.toLocaleString()}</div>
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
                    <button onClick={() => setEditingProduct(p)} className="w-full py-3 border border-slate-200 rounded-md text-xs font-black text-slate-600 hover:bg-slate-50 transition">Edit Details</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
                  <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-bold italic">No active customer orders yet.</td></tr>
                ) : (
                  sellerOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-8 font-black text-slate-900">#{o.id}</td>
                      <td className="p-8">
                        <p className="font-bold text-slate-800 text-sm">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{o.customerPhone}</p>
                      </td>
                      <td className="p-8 text-right font-black text-green-600">Rs. {o.totalAmount?.toLocaleString()}</td>
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
               <h3 className="text-xl font-black mb-8 border-b pb-4 text-slate-900">Identity & Settlement Profile</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Owner Legal Name</label>
                     <p className="font-black text-slate-800">{currentUser?.fullName}</p>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">WhatsApp Mobile</label>
                     <p className="font-black text-slate-800">{currentUser?.phoneNumber}</p>
                   </div>
                 </div>
                 <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Registered Gmail</label>
                     <p className="font-black text-slate-800 underline">{currentUser?.email}</p>
                   </div>
                   <div className="p-6 bg-slate-900 rounded-lg text-white">
                     <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Payment Destination Account</label>
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
                <h2 className="text-2xl font-black text-slate-900">{editingProduct.id ? 'Modify Listing' : 'New Listing'}</h2>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-red-500 text-2xl font-black">×</button>
              </header>

              <div className="space-y-8">
                <section>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 tracking-widest">Gallery Preview</label>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-48 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                      {editingProduct.imageUrl ? (
                        <img src={editingProduct.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                      ) : (
                        <span className="text-slate-300 text-4xl">🖼️</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <p className="text-sm font-medium text-slate-500">Pick clear photos from your device for better customer conversion.</p>
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
                        📁 Select from Device
                      </button>
                      <input 
                        type="text" 
                        placeholder="...or paste image URL link" 
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
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Description</label>
                  <textarea 
                    className="w-full p-4 rounded-lg border font-bold outline-none h-32 leading-relaxed" 
                    value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 bg-slate-50 rounded-lg font-black text-slate-400 hover:bg-slate-100 transition">Discard</button>
                <button onClick={handleSaveProduct} className="flex-1 py-4 bg-[#febd69] text-[#131921] rounded-lg font-black shadow-xl hover:bg-[#f3a847] transition">Publish to Market</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
