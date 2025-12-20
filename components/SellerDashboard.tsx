
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
  });

  const sellerProducts = products?.filter(p => p.sellerId === currentUser?.id) || [];
  const sellerOrders = orders?.filter(o => o.sellerId === currentUser?.id) || [];

  const handleRegister = () => {
    if(!regData.fullName || !regData.shopName || !regData.accountNumber || !regData.email) {
      alert("Registration Error: Please provide all verification details.");
      return;
    }
    
    const shopSlug = regData.shopName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      id: 's' + Math.random().toString(36).substr(2, 9),
      fullName: regData.fullName,
      email: regData.email,
      phoneNumber: regData.phoneNumber,
      payoutMethod: regData.payoutMethod,
      accountNumber: regData.accountNumber,
      shopName: regData.shopName,
      shopSlug: shopSlug,
      joinedAt: new Date().toISOString(),
      status: 'active' // Ensure seller is active upon registration
    };

    const shopLink = `${window.location.origin}/#/shop/${shopSlug}`;
    
    const message = `*VEO-PK ADMIN: NEW SELLER ACTIVATED*%0A` +
                    `--------------------------%0A` +
                    `*Status:* ACTIVE (Seller Protex)%0A` +
                    `*Shop:* ${newSeller.shopName}%0A` +
                    `*Slug:* ${newSeller.shopSlug}%0A` +
                    `*Owner:* ${newSeller.fullName}%0A` +
                    `*Payout:* ${newSeller.payoutMethod} - ${newSeller.accountNumber}%0A%0A` +
                    `*Open Shop:* ${shopLink}`;

    onUpdateSellers([...sellers, newSeller]);
    setCurrentUser(newSeller);
    setRegSuccess(true);
    setIsRegistering(false);

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        ...(editingProduct as Omit<Product, 'id' | 'sellerId' | 'shopId' | 'createdAt'>),
        id: 'p' + Math.random().toString(36).substr(2, 9),
        sellerId: currentUser.id,
        shopId: currentUser.id, // Linked by unique seller ID
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

  const shareShop = (platform: 'whatsapp' | 'facebook' | 'instagram') => {
    if (!currentUser) return;
    const url = `${window.location.origin}/#/shop/${currentUser.shopSlug}`;
    const text = `Check out my shop "${currentUser.shopName}" on PK-MART! 🇵🇰🛍️`;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    } else if (platform === 'facebook' || platform === 'instagram') {
      // Direct sharing to FB; Instagram usually requires mobile app or bio links
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
  };

  if (regSuccess && currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-2xl w-full bg-white p-12 rounded-2xl shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">✓</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Store Active & Live!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Congratulations! <b>{currentUser.shopName}</b> is now visible to customers. Your status is <b>ACTIVE</b>.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-dashed mb-10">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Seller Protex Social Kit</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => shareShop('whatsapp')} className="bg-[#25D366] text-white px-6 py-3 rounded-lg font-black text-sm shadow-md hover:scale-105 transition">WhatsApp</button>
              <button onClick={() => shareShop('facebook')} className="bg-[#1877F2] text-white px-6 py-3 rounded-lg font-black text-sm shadow-md hover:scale-105 transition">Facebook/Instagram</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Link to={`/shop/${currentUser.shopSlug}`} className="flex-1 bg-[#131921] text-white py-4 rounded-lg font-black text-lg shadow-xl">Open My Website</Link>
            <button onClick={() => setRegSuccess(false)} className="flex-1 bg-[#febd69] text-[#131921] py-4 rounded-lg font-black text-lg shadow-xl">Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] py-20 px-4 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full p-10 bg-white rounded-xl shadow-xl">
          <div className="mb-10 text-center">
             <h1 className="text-3xl font-black text-slate-900 mb-2">Shop Activation</h1>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verify identity with Seller Protex</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Legal Name</label>
              <input 
                type="text" className="w-full rounded-lg border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Gmail Address</label>
              <input 
                type="email" className="w-full rounded-lg border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Unique Shop Name (e.g. Oops)</label>
              <input 
                type="text" placeholder="This will be your website link" className="w-full rounded-lg border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
              />
            </div>
            <div className="p-6 bg-slate-900 rounded-lg text-white">
              <h3 className="text-xs font-black uppercase text-[#febd69] mb-4 tracking-widest">Payout Logistics</h3>
              <div className="flex flex-col gap-4">
                <select 
                  className="w-full bg-slate-800 rounded-lg p-3 font-bold border border-slate-700 outline-none"
                  value={regData.payoutMethod} onChange={e => setRegData({...regData, payoutMethod: e.target.value as SellerPayoutMethod})}
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <input 
                  type="text" placeholder="Account Number" className="w-full bg-slate-800 rounded-lg p-3 font-mono outline-none border border-slate-700" 
                  value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={handleRegister}
              className="w-full py-5 rounded-lg bg-[#25D366] text-white font-black text-xl shadow-lg hover:bg-[#128C7E] transition"
            >
              Activate Shop Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f3f3] font-sans">
      <div className="w-full lg:w-64 bg-[#131921] text-white p-6 flex flex-col shadow-xl z-10">
        <Link to="/" className="text-xl font-black mb-10 block">PK<span className="text-[#febd69]">-</span>MART</Link>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('products')} className={`w-full text-left p-4 rounded-lg font-bold transition ${activeTab === 'products' ? 'bg-slate-800 text-[#febd69]' : 'text-slate-400'}`}>Gallery & Items</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-4 rounded-lg font-bold transition ${activeTab === 'orders' ? 'bg-slate-800 text-[#febd69]' : 'text-slate-400'}`}>Live Orders</button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-4 rounded-lg font-bold transition ${activeTab === 'profile' ? 'bg-slate-800 text-[#febd69]' : 'text-slate-400'}`}>Shop Identity</button>
        </nav>
        <button onClick={() => setCurrentUser(null)} className="mt-auto py-3 bg-red-900/20 text-red-400 rounded-lg font-black text-xs border border-red-900/20">Sign Out</button>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
           <div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">{currentUser?.shopName}</h1>
             <p className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest mt-1">Status: Active • Protex Verified</p>
           </div>
           {activeTab === 'products' && (
             <button onClick={() => setEditingProduct({})} className="bg-[#febd69] text-[#131921] px-8 py-4 rounded-lg font-black text-sm shadow-xl hover:bg-[#f3a847] transition transform active:scale-95">
               + Upload Photo & Item
             </button>
           )}
        </header>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {sellerProducts.length === 0 ? (
              <div className="col-span-full py-32 text-center text-slate-300 font-bold border-2 border-dashed rounded-2xl bg-white">
                <div className="text-5xl mb-4">📸</div>
                <p>Use Protex to upload photos from your gallery.</p>
              </div>
            ) : (
              sellerProducts.map(p => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition group">
                  <div className="h-56 bg-slate-50 p-4 flex items-center justify-center relative">
                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                  </div>
                  <div className="p-8">
                    <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{p.name}</h3>
                    <div className="text-emerald-600 font-black text-xl mb-6">Rs. {p.price.toLocaleString()}</div>
                    <button onClick={() => setEditingProduct(p)} className="w-full py-3 border-2 border-slate-100 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-50 transition">Modify Item</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Other tabs remain consistent with robust UI */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr><th className="p-8 text-[10px] font-black uppercase text-slate-400">Order Ref</th><th className="p-8 text-[10px] font-black uppercase text-slate-400">Customer</th><th className="p-8 text-right text-[10px] font-black uppercase text-slate-400">Net Share</th></tr>
              </thead>
              <tbody className="divide-y">
                {sellerOrders.length === 0 ? (
                  <tr><td colSpan={3} className="p-20 text-center text-slate-300 font-bold italic">No active orders yet. Share your "Oops" link on social media!</td></tr>
                ) : (
                  sellerOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition">
                      <td className="p-8 font-black">#{o.id}</td>
                      <td className="p-8">
                        <p className="font-bold text-slate-800 text-sm">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{o.customerPhone}</p>
                      </td>
                      <td className="p-8 text-right font-black text-emerald-600">Rs. {o.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-10 rounded-2xl shadow-sm border animate-in fade-in">
             <h3 className="text-xl font-black mb-8 border-b pb-4">Seller Identity</h3>
             <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Legal Owner</label>
                    <p className="font-black text-slate-800">{currentUser?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">WhatsApp</label>
                    <p className="font-black text-slate-800">{currentUser?.phoneNumber}</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-900 rounded-xl text-white shadow-xl">
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-3">Settlement Account</label>
                  <p className="font-mono text-lg font-bold text-[#febd69] tracking-widest">{currentUser?.accountNumber}</p>
                  <p className="text-[9px] font-black text-slate-500 mt-3 uppercase">PROVIDER: {currentUser?.payoutMethod}</p>
                </div>
                <div className="pt-6">
                   <label className="text-[10px] font-black text-slate-400 uppercase block mb-4">Dynamic Website Link</label>
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-dashed">
                      <span className="text-xs font-bold text-slate-500 flex-1 truncate">{window.location.origin}/#/shop/{currentUser?.shopSlug}</span>
                      <Link to={`/shop/${currentUser?.shopSlug}`} target="_blank" className="text-[10px] font-black text-blue-600 uppercase">Open Site</Link>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-3xl p-10 max-h-[90vh] overflow-auto shadow-2xl animate-in zoom-in">
              <header className="flex justify-between items-center mb-10 border-b pb-6">
                <h2 className="text-2xl font-black text-slate-900">Protex Gallery Upload</h2>
                <button onClick={() => setEditingProduct(null)} className="text-slate-300 hover:text-red-500 text-3xl font-black transition">×</button>
              </header>

              <div className="space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Select Product Photo</label>
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition overflow-hidden"
                    >
                      {editingProduct.imageUrl ? (
                        <img src={editingProduct.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                      ) : (
                        <div className="text-center">
                          <div className="text-5xl mb-4">🖼️</div>
                          <p className="text-xs font-black text-slate-400">Click to Browse Gallery</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleGalleryUpload} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Product Title</label>
                      <input type="text" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold focus:border-[#febd69] outline-none" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Price (PKR)</label>
                      <input type="number" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold focus:border-[#febd69] outline-none" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                   </div>
                </div>
                <textarea placeholder="Description" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold h-28 outline-none focus:border-[#febd69]" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 bg-slate-50 rounded-xl font-black text-slate-400">Cancel</button>
                <button onClick={handleSaveProduct} className="flex-1 py-4 bg-[#febd69] text-[#131921] rounded-xl font-black shadow-xl">Save & Publish</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
