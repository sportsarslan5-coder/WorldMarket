
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

// Admin WhatsApp number as requested: +92 307 9490 721
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
      alert("Missing Information: Please complete all fields to register your shop.");
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

    // Construct the review link that Admin can click on WhatsApp
    const baseAppUrl = window.location.href.split('#')[0];
    const reviewLink = `${baseAppUrl}#/admin/sellers`;

    // Professional WhatsApp Message for Admin
    const message = `*NEW VENDOR REGISTRATION ALERT*%0A%0A` +
                    `*Owner:* ${newSeller.fullName}%0A` +
                    `*Shop:* ${newSeller.shopName}%0A` +
                    `*WhatsApp:* ${newSeller.phoneNumber}%0A` +
                    `*Payout:* ${newSeller.payoutMethod} (${newSeller.accountNumber})%0A%0A` +
                    `*Action Required:* Review and approve this vendor.%0A` +
                    `*Click to Review Website:* ${reviewLink}`;

    onUpdateSellers([...sellers, newSeller]);
    setCurrentUser(newSeller);
    setRegSuccess(true);
    setIsRegistering(false);

    // Trigger WhatsApp notification to Admin
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
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Data Sent to Admin</h2>
          <p className="text-slate-500 font-medium text-lg mb-10 leading-relaxed">
            Your shop <b>{currentUser.shopName}</b> is pending verification. The admin has received your data via WhatsApp.
          </p>
          
          <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 mb-10">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Your Store Link (Internal)</p>
            <div className="text-xl font-bold text-blue-600 break-all mb-4">
               {window.location.origin}/#/shop/{currentUser.shopSlug}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Link to={`/shop/${currentUser.shopSlug}`} className="flex-1 py-5 bg-[#131921] text-white rounded-md font-black text-lg shadow-xl hover:bg-black transition text-center">Visit My Store</Link>
            <button onClick={() => setRegSuccess(false)} className="flex-1 py-5 bg-[#febd69] text-[#131921] rounded-md font-black text-lg shadow-xl hover:bg-[#f3a847] transition">Go to Dashboard</button>
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
            <h1 className="text-3xl font-black text-slate-900 mb-2">Join PK-MART</h1>
            <p className="text-slate-500 font-medium">Your data will be securely sent to our Admin team via WhatsApp.</p>
          </div>
          
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Full Name" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                  value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
                />
                <input 
                  type="email" placeholder="Gmail Address" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                  value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
                />
              </div>
              <input 
                type="text" placeholder="WhatsApp Phone (e.g. 03001234567)" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})}
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Store Setup</h3>
              <input 
                type="text" placeholder="Shop Name" className="w-full rounded-md border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
              />
            </section>
            
            <section className="space-y-4 p-6 bg-[#232f3e] rounded-lg text-white">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#febd69]">Payout Logistics</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <select 
                  className="flex-1 bg-slate-800 rounded-md p-3 font-bold outline-none border border-slate-700"
                  value={regData.payoutMethod} onChange={e => setRegData({...regData, payoutMethod: e.target.value as SellerPayoutMethod})}
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <input 
                  type="text" placeholder="Account Number" className="flex-[2] bg-slate-800 rounded-md p-3 font-mono outline-none border border-slate-700" 
                  value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})}
                />
              </div>
            </section>

            <button 
              onClick={handleRegister}
              className="w-full py-5 rounded-md bg-[#25D366] text-white font-black text-lg shadow-lg hover:bg-[#128C7E] transition transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Confirm & Send to Admin
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

        <nav className="flex-1 space-y-2">
          {[
            { id: 'products', label: 'My Inventory', icon: '📦' },
            { id: 'orders', label: 'Customer Orders', icon: '📝' },
            { id: 'profile', label: 'Shop Identity', icon: '👤' }
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
           <button onClick={() => setCurrentUser(null)} className="w-full py-3 bg-red-900/20 text-red-400 rounded-md text-xs font-black border border-red-900/30 hover:bg-red-900/40 transition">Sign Out</button>
        </div>
      </div>

      <div className="flex-1 p-8 lg:p-16 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
           <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">{currentUser?.shopName || "Store Dashboard"}</h1>
             <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Direct-to-Admin Seller Portal</p>
           </div>
           {activeTab === 'products' && (
             <button onClick={() => setEditingProduct({})} className="bg-[#febd69] text-[#131921] px-8 py-3 rounded-md font-black shadow-md hover:bg-[#f3a847] transition transform active:scale-95">
               + Add Product
             </button>
           )}
        </header>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {sellerProducts.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-black">No products listed yet. Start selling now!</p>
              </div>
            ) : (
              sellerProducts.map(p => (
                <div key={p.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition">
                  <div className="h-56 bg-[#f8f8f8] p-4 flex items-center justify-center">
                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain" alt={p.name} />
                  </div>
                  <div className="p-8">
                    <h3 className="font-bold text-slate-900 mb-2 truncate">{p.name}</h3>
                    <div className="font-black text-emerald-600 mb-6">Rs. {p.price?.toLocaleString()}</div>
                    <button onClick={() => setEditingProduct(p)} className="w-full py-3 border border-slate-200 rounded-md text-xs font-black text-slate-600 hover:bg-slate-50 transition">Edit Product</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerOrders.length === 0 ? (
                  <tr><td colSpan={3} className="p-20 text-center text-slate-300 font-bold italic">Waiting for your first order...</td></tr>
                ) : (
                  sellerOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="p-8 font-black text-slate-900">#{o.id}</td>
                      <td className="p-8">
                        <p className="font-bold text-slate-800 text-sm">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{o.customerPhone}</p>
                      </td>
                      <td className="p-8 text-right font-black text-green-600">Rs. {o.totalAmount?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className="max-w-3xl animate-in fade-in">
             <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-xl font-black mb-8 border-b pb-4 text-slate-900">Registered Identity</h3>
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Legal Name</label>
                      <p className="font-black text-slate-800">{currentUser?.fullName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">WhatsApp</label>
                      <p className="font-black text-slate-800">{currentUser?.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-lg text-white">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Disbursement IBAN / Account</label>
                    <p className="font-mono text-sm font-bold text-[#febd69]">{currentUser?.accountNumber}</p>
                    <p className="text-[9px] font-black text-slate-500 mt-2">METHOD: {currentUser?.payoutMethod}</p>
                  </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-[#131921]/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-lg shadow-2xl p-10 max-h-[90vh] overflow-auto">
              <header className="flex justify-between items-center mb-8 border-b pb-6">
                <h2 className="text-2xl font-black text-slate-900">Listing Editor</h2>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-red-500 text-2xl font-black">×</button>
              </header>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Title</label>
                  <input type="text" className="w-full p-4 rounded-lg border font-bold" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Price (PKR)</label>
                  <input type="number" className="w-full p-4 rounded-lg border font-bold" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
                  <select className="w-full p-4 rounded-lg border font-bold" value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                    <option value="General">General</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Sports">Sports</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</label>
                  <textarea className="w-full p-4 rounded-lg border font-bold h-24" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Image URL</label>
                  <input type="text" className="w-full p-4 rounded-lg border font-bold" value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 bg-slate-50 rounded-lg font-black text-slate-400">Cancel</button>
                <button onClick={handleSaveProduct} className="flex-1 py-4 bg-[#febd69] text-[#131921] rounded-lg font-black shadow-lg">Save & Publish</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
