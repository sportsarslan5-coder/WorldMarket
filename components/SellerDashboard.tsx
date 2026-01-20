
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.ts';
import { Shop, Product } from '../types.ts';
import { Link } from 'react-router-dom';
import GlobalShareModal from './GlobalShareModal.tsx';

const SellerDashboard: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [regForm, setRegForm] = useState({ name: '', whatsapp: '', email: '' });
  const [prodForm, setProdForm] = useState({ name: '', price: '', cat: 'Sports', desc: '' });

  const SESSION_KEY = 'PKMART_VENDOR_ID';

  useEffect(() => {
    const savedId = localStorage.getItem(SESSION_KEY);
    if (savedId) {
      loadShopData(savedId);
    }
  }, []);

  const loadShopData = async (id: string) => {
    const shops = await api.fetchAllShops();
    const found = shops.find(s => s.id === id);
    if (found) {
      setShop(found);
      const p = await api.fetchSellerProducts(found.id);
      setProducts(p);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    const newShop = await api.registerSeller(regForm);
    localStorage.setItem(SESSION_KEY, newShop.id);
    setShop(newShop);
    setIsSyncing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !imagePreview) return;
    setIsSyncing(true);

    const product: Product = {
      id: 'PRD-' + Date.now(),
      sellerId: shop.id,
      sellerName: shop.name,
      name: prodForm.name,
      description: prodForm.desc,
      price: Number(prodForm.price),
      views: 0,
      currency: "PKR",
      category: prodForm.cat,
      imageUrl: imagePreview,
      stock: 100,
      published: true,
      createdAt: new Date().toISOString()
    };

    await api.uploadProduct(product);
    await loadShopData(shop.id);
    setShowUpload(false);
    setImagePreview(null);
    setIsSyncing(false);
    setProdForm({ name: '', price: '', cat: 'Sports', desc: '' });
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border border-slate-100 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Vendor Hub</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Connect to Pakistan's Digital Grid</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Business Name</label>
               <input required placeholder="e.g. Sialkot Pro Gears" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-600/20 font-bold" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp (92...)</label>
               <input required placeholder="e.g. 923001234567" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-600/20 font-bold" value={regForm.whatsapp} onChange={e => setRegForm({...regForm, whatsapp: e.target.value})} />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Email</label>
               <input required type="email" placeholder="e.g. sales@mygear.com" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-600/20 font-bold" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
            </div>

            <button disabled={isSyncing} className="w-full h-16 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-green-600 transition disabled:opacity-50 active:scale-95">
              {isSyncing ? 'Registering...' : 'Launch Digital Store'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col lg:flex-row font-sans">
      <aside className="w-full lg:w-80 bg-white border-r border-slate-100 p-8 flex flex-col h-screen sticky top-0 z-50">
        <div className="text-xl font-black italic mb-12 tracking-tighter">PK<span className="text-green-600">MART</span> Vendor</div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition ${activeTab === 'inventory' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>Inventory</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>Settings</button>
        </nav>
        <div className="pt-8 space-y-3">
          <Link to={`/shop/${shop.slug}`} target="_blank" className="block w-full text-center py-4 bg-green-50 text-green-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition">View Store</Link>
          <button onClick={() => setIsShareOpen(true)} className="block w-full text-center py-4 bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Share Link</button>
        </div>
        <button onClick={() => { localStorage.removeItem(SESSION_KEY); window.location.reload(); }} className="mt-8 text-slate-300 font-bold text-[9px] uppercase tracking-widest hover:text-red-500 transition">Logout Account</button>
      </aside>

      <main className="flex-1 p-8 lg:p-16">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">{shop.name}</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1 italic">/shop/{shop.slug}</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition active:scale-95 shadow-xl">Add Product</button>
        </header>

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No products listed</p>
                <button onClick={() => setShowUpload(true)} className="text-green-600 font-black text-xs mt-4 hover:underline">Start your first deployment</button>
              </div>
            ) : products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[30px] border border-slate-100 group hover:shadow-2xl transition-all">
                <div className="aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center p-8 overflow-hidden relative">
                   <img src={p.imageUrl} alt="" className="max-h-full mix-blend-multiply group-hover:scale-110 transition duration-700" />
                </div>
                <h3 className="font-bold text-lg mb-1 truncate">{p.name}</h3>
                <p className="text-2xl font-black text-slate-900 mb-6">Rs. {p.price.toLocaleString()}</p>
                <div className="flex gap-2">
                   <button className="flex-1 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition">Edit</button>
                   <button onClick={() => api.deleteProduct(p.id).then(() => loadShopData(shop.id))} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <GlobalShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        title={shop.name} 
        url={`${window.location.origin}/#/shop/${shop.slug}`} 
      />

      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => !isSyncing && setShowUpload(false)}>
          <div className="bg-white p-10 rounded-[40px] max-w-xl w-full animate-fade-in relative shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {isSyncing ? (
              <div className="py-20 flex flex-col items-center text-center space-y-6">
                 <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                 <p className="font-black uppercase text-xs tracking-widest">Syncing with PK MART Global Grid...</p>
              </div>
            ) : (
              <>
                <button onClick={() => setShowUpload(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition">✕</button>
                <h2 className="text-2xl font-black mb-8 tracking-tighter uppercase italic">Deploy New Item</h2>
                <form onSubmit={handleSaveProduct} className="space-y-5">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition bg-slate-50 relative overflow-hidden"
                  >
                    {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply" /> : <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Product Asset</p>}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Item Title" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
                    <input required placeholder="Price (PKR)" type="number" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} />
                  </div>
                  <select className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={prodForm.cat} onChange={e => setProdForm({...prodForm, cat: e.target.value})}>
                    <option value="Sports">Sports Gear</option>
                    <option value="Fashion">Apparel</option>
                    <option value="Electronics">Tech & Gadgets</option>
                  </select>
                  <textarea placeholder="Product Story / Details..." className="w-full h-28 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold resize-none" value={prodForm.desc} onChange={e => setProdForm({...prodForm, desc: e.target.value})} />
                  <button className="w-full h-16 bg-slate-900 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-green-600 transition-all active:scale-95">Publish to Marketplace</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
