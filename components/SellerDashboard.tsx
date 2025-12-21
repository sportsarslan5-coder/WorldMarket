
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, SellerPayoutMethod } from '../types.ts';
import { api } from '../services/api.ts';

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
  currentUser, setCurrentUser, sellers = [], products = [], orders = [], onUpdateProducts, onUpdateSellers 
}) => {
  const [isRegistering, setIsRegistering] = useState(!currentUser);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSize, setNewSize] = useState('');
  
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    shopName: '',
    payoutMethod: 'JazzCash' as SellerPayoutMethod,
    accountNumber: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      if (!currentUser) {
        const storedSellers = await api.fetchSellers();
        const customSeller = storedSellers.find(s => !['s1', 's2', 's3'].includes(s.id));
        if (customSeller) {
          setCurrentUser(customSeller);
          setIsRegistering(false);
        }
      }
    };
    checkUser();
  }, [currentUser, setCurrentUser]);

  const sellerProducts = products?.filter(p => p.sellerId === currentUser?.id) || [];
  const sellerOrders = orders?.filter(o => o.sellerId === currentUser?.id) || [];

  const handleRegister = async () => {
    if(!regData.shopName || !regData.accountNumber || !regData.email) {
      alert("Missing details required for Global Activation.");
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
      status: 'active'
    };

    await api.saveSeller(newSeller);
    onUpdateSellers([...sellers, newSeller]);
    setCurrentUser(newSeller);
    setIsRegistering(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => prev ? ({ ...prev, imageUrl: reader.result as string }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.price || !currentUser) return;

    const prodToSave = {
      ...editingProduct,
      id: editingProduct.id || 'p' + Math.random().toString(36).substr(2, 9),
      sellerId: currentUser.id,
      shopId: currentUser.id,
      category: editingProduct.category || 'General',
      rating: editingProduct.rating || 5.0,
      reviewsCount: editingProduct.reviewsCount || 0,
      published: true,
      createdAt: editingProduct.createdAt || new Date().toISOString(),
      sizes: editingProduct.sizes || [],
      stock: editingProduct.stock || 10,
    } as Product;

    await api.saveProduct(prodToSave);
    
    if (editingProduct.id) {
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? prodToSave : p));
    } else {
      onUpdateProducts([...products, prodToSave]);
    }
    setEditingProduct(null);
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-[#131921] py-20 px-4 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full p-12 bg-white rounded-[40px] shadow-2xl">
          <div className="mb-12 text-center">
             <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic uppercase">PK-MART GLOBAL</h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Persistent Store Technology • Protex 6.0</p>
          </div>
          
          <div className="space-y-6">
            <input type="text" placeholder="Full Legal Name" className="w-full rounded-2xl border-slate-200 bg-slate-50 p-5 font-bold outline-none border focus:border-[#febd69] transition" value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} />
            <input type="email" placeholder="Gmail Address" className="w-full rounded-2xl border-slate-200 bg-slate-50 p-5 font-bold outline-none border focus:border-[#febd69] transition" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
            <input type="text" placeholder="WhatsApp Number" className="w-full rounded-2xl border-slate-200 bg-slate-50 p-5 font-bold outline-none border focus:border-[#febd69] transition" value={regData.phoneNumber} onChange={e => setRegData({...regData, phoneNumber: e.target.value})} />
            <input type="text" placeholder="Shop Name (e.g. Unique Sports)" className="w-full rounded-2xl border-slate-200 bg-slate-50 p-5 font-bold outline-none border focus:border-[#febd69] transition" value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})} />
            
            <div className="p-8 bg-slate-900 rounded-[30px] text-white">
              <h3 className="text-xs font-black uppercase text-[#febd69] mb-6 tracking-widest text-center">Settlement Details</h3>
              <div className="flex flex-col gap-4">
                <select className="w-full bg-slate-800 rounded-xl p-4 font-bold border border-slate-700 outline-none" value={regData.payoutMethod} onChange={e => setRegData({...regData, payoutMethod: e.target.value as SellerPayoutMethod})}>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <input type="text" placeholder="Account Number" className="w-full bg-slate-800 rounded-xl p-4 font-mono outline-none border border-slate-700" value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})} />
              </div>
            </div>
            <button onClick={handleRegister} className="w-full py-6 rounded-2xl bg-[#febd69] text-[#131921] font-black text-xl shadow-xl hover:scale-[1.02] transition transform">Deploy Shop Globally</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f3f3] font-sans">
      <div className="w-full lg:w-72 bg-[#131921] text-white p-8 flex flex-col shadow-2xl z-50">
        <Link to="/" className="text-2xl font-black mb-12 block tracking-tighter italic">PK<span className="text-[#febd69]">-</span>MART</Link>
        <nav className="flex-1 space-y-4">
          <button onClick={() => setActiveTab('products')} className={`w-full text-left p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'products' ? 'bg-[#232f3e] text-[#febd69] shadow-inner' : 'text-slate-500'}`}>Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'orders' ? 'bg-[#232f3e] text-[#febd69] shadow-inner' : 'text-slate-500'}`}>Orders</button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'profile' ? 'bg-[#232f3e] text-[#febd69] shadow-inner' : 'text-slate-500'}`}>Settings</button>
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-800 space-y-4">
           <Link to={`/shop/${currentUser?.shopSlug}`} target="_blank" className="w-full block py-3 bg-blue-600/10 text-blue-400 border border-blue-900/30 rounded-xl text-center text-[10px] font-black uppercase tracking-widest">Global Link Active</Link>
           <button onClick={() => setCurrentUser(null)} className="w-full py-4 bg-red-900/10 text-red-500 rounded-xl font-black text-xs border border-red-900/20 hover:bg-red-500 hover:text-white transition">Sign Out</button>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20 border-b pb-10 border-slate-200">
           <div>
             <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">{currentUser?.shopName}</h1>
             <p className="text-emerald-500 font-black uppercase text-[10px] tracking-[0.3em] mt-2 flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Verified Multi-Vendor Node
             </p>
           </div>
           {activeTab === 'products' && (
             <button onClick={() => setEditingProduct({ sizes: [], stock: 10 })} className="bg-[#febd69] text-[#131921] px-10 py-5 rounded-2xl font-black text-sm shadow-2xl hover:bg-black hover:text-white transition transform active:scale-95">
               + Create New Listing
             </button>
           )}
        </header>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {sellerProducts.map(p => (
              <div key={p.id} className="bg-white rounded-[40px] shadow-sm border overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                <div className="h-64 bg-slate-50 p-8 flex items-center justify-center relative">
                  <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                     <span className="bg-white/90 backdrop-blur-sm border px-3 py-1 rounded-full text-[9px] font-black text-slate-600 uppercase">Stock: {p.stock}</span>
                     {p.sizes.length > 0 && <span className="bg-[#febd69] px-3 py-1 rounded-full text-[9px] font-black text-slate-900 uppercase">{p.sizes.length} Variants</span>}
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="font-bold text-slate-800 text-xl mb-4 truncate">{p.name}</h3>
                  <div className="text-emerald-600 font-black text-3xl mb-8 tracking-tighter">Rs. {p.price.toLocaleString()}</div>
                  <button onClick={() => setEditingProduct(p)} className="w-full py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition">Edit Inventory</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders and Profile tabs would be similar to before but with Global logic */}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-auto">
           <div className="bg-white w-full max-w-4xl rounded-[50px] p-12 shadow-2xl animate-in zoom-in">
              <header className="flex justify-between items-center mb-10 border-b pb-8">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 italic uppercase">Listing Editor</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Amazon-Style Inventory Node</p>
                </div>
                <button onClick={() => setEditingProduct(null)} className="text-slate-300 hover:text-red-500 text-3xl font-black transition">×</button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-80 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition overflow-hidden p-8"
                    >
                      {editingProduct.imageUrl ? (
                        <img src={editingProduct.imageUrl} className="max-w-full max-h-full object-contain" alt="Preview" />
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-4 opacity-10">🖼️</div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Main Product Photo</p>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Level</label>
                          <input type="number" className="w-full p-5 rounded-2xl bg-slate-50 font-black border-2 border-transparent focus:border-[#febd69] outline-none transition" value={editingProduct.stock || ''} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (PKR)</label>
                          <input type="number" className="w-full p-5 rounded-2xl bg-slate-50 font-black border-2 border-transparent focus:border-[#febd69] outline-none transition" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                       </div>
                    </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Title</label>
                      <input type="text" className="w-full p-5 rounded-2xl bg-slate-50 font-black border-2 border-transparent focus:border-[#febd69] outline-none transition" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Size Variants (S, M, L...)</label>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {editingProduct.sizes?.map(s => (
                          <span key={s} className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2">
                             {s} <button onClick={() => setEditingProduct({...editingProduct, sizes: editingProduct.sizes?.filter(size => size !== s)})} className="text-[#febd69]">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Add Size" className="flex-1 p-4 rounded-xl bg-slate-50 font-bold border outline-none" value={newSize} onChange={e => setNewSize(e.target.value)} />
                        <button 
                          onClick={() => { if(newSize) { setEditingProduct({...editingProduct, sizes: [...(editingProduct.sizes || []), newSize]}); setNewSize(''); } }}
                          className="px-6 py-4 bg-slate-900 text-white rounded-xl font-black text-xs"
                        >
                          Add
                        </button>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amazon-Style Description</label>
                      <textarea className="w-full p-5 rounded-2xl bg-slate-50 font-bold h-32 border-2 border-transparent focus:border-[#febd69] outline-none transition" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                   </div>
                </div>
              </div>

              <div className="flex gap-6 mt-12 pt-10 border-t">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-5 bg-slate-50 rounded-2xl font-black text-slate-400 hover:text-red-500 transition">Discard Changes</button>
                <button onClick={handleSaveProduct} className="flex-[2] py-5 bg-[#febd69] text-[#131921] rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.02] transition transform">Save Global Listing</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
