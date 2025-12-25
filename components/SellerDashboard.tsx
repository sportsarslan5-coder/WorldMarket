
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shop, Product } from '../types.ts';
import { Link } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings' | 'performance'>('inventory');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  
  const [regForm, setRegForm] = useState({ name: '', whatsapp: '', email: '' });
  const [prodForm, setProdForm] = useState({ name: '', price: '', img: '', size: '', cat: 'Fashion', desc: '' });
  const [settingsForm, setSettingsForm] = useState({ name: '', whatsapp: '', desc: '' });

  useEffect(() => {
    const savedId = localStorage.getItem('PK_ACTIVE_SELLER_ID');
    if (savedId) {
      loadShopData(savedId);
    }
  }, []);

  const loadShopData = async (id: string) => {
    const shops = await api.fetchAllShops();
    const found = shops.find(s => s.id === id);
    if (found) {
      setShop(found);
      setSettingsForm({ name: found.name, whatsapp: found.whatsappNumber, desc: found.description });
      const p = await api.fetchSellerProducts(found.id);
      setProducts(p);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    const newShop = await api.registerSeller(regForm);
    setShop(newShop);
    localStorage.setItem('PK_ACTIVE_SELLER_ID', newShop.id);
    setIsSyncing(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsSyncing(true);

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, {
        name: prodForm.name,
        price: Number(prodForm.price),
        imageUrl: prodForm.img,
        size: prodForm.size,
        category: prodForm.cat,
        description: prodForm.desc
      });
    } else {
      const product: Product = {
        id: 'PRD-' + Date.now(),
        sellerId: shop.id,
        sellerName: shop.name,
        name: prodForm.name,
        description: prodForm.desc || "Premium Quality Global SKU",
        price: Number(prodForm.price),
        currency: "PKR",
        category: prodForm.cat,
        imageUrl: prodForm.img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        size: prodForm.size,
        stock: 99,
        published: true,
        createdAt: new Date().toISOString()
      };
      await api.uploadProduct(product);
    }

    await loadShopData(shop.id);
    setShowUpload(false);
    setEditingProduct(null);
    setIsSyncing(false);
    setProdForm({ name: '', price: '', img: '', size: '', cat: 'Fashion', desc: '' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Permanent deletion? This SKU will vanish from the marketplace.")) return;
    await api.deleteProduct(id);
    if (shop) loadShopData(shop.id);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsSyncing(true);
    await api.updateShop(shop.id, {
      name: settingsForm.name,
      whatsappNumber: settingsForm.whatsapp,
      description: settingsForm.desc
    });
    await loadShopData(shop.id);
    setIsSyncing(false);
    alert("Node configurations updated successfully.");
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      price: p.price.toString(),
      img: p.imageUrl,
      size: p.size || '',
      cat: p.category,
      desc: p.description
    });
    setShowUpload(true);
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-xl p-12 md:p-16 rounded-[60px] shadow-2xl animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2 italic">BECOME A VENDOR</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Only 5% commission. 100% control.</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <input required placeholder="Business/Shop Name" className="w-full p-6 bg-slate-50 rounded-3xl font-black text-lg outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
            <input required placeholder="WhatsApp Number (for orders)" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.whatsapp} onChange={e => setRegForm({...regForm, whatsapp: e.target.value})} />
            <input required type="email" placeholder="Official Email Address" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />

            <button disabled={isSyncing} className="w-full bg-slate-900 text-white py-8 rounded-[30px] font-black text-xl shadow-2xl active:scale-95 transition-all hover:bg-blue-600">
              {isSyncing ? 'INITIALIZING STORE...' : 'LAUNCH MERCHANT ACCOUNT'}
            </button>
            <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">By continuing, you agree to our 5% Service Agreement</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans">
      <aside className="w-full lg:w-80 bg-slate-900 text-white p-10 flex flex-col h-screen sticky top-0 border-r border-white/5">
        <div className="text-2xl font-black italic mb-20 tracking-tighter">MERCHANT_CENTER</div>
        <div className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Inventory Control</button>
          <button onClick={() => setActiveTab('performance')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'performance' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Live Performance</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Store Config</button>
          
          <div className="pt-10">
            <Link to={`/shop/${shop.slug}`} target="_blank" className="block w-full text-center py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition">Preview Public Site</Link>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('PK_ACTIVE_SELLER_ID'); window.location.reload(); }} className="text-slate-600 font-black text-[10px] uppercase hover:text-red-500 transition">Log Out</button>
      </aside>

      <main className="flex-1 p-8 lg:p-20 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900 leading-[0.8] mb-4">{shop.name}</h1>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Vendor Managed Environment</p>
          </div>
          {activeTab === 'inventory' && (
            <button onClick={() => { setEditingProduct(null); setProdForm({ name: '', price: '', img: '', size: '', cat: 'Fashion', desc: '' }); setShowUpload(true); }} className="bg-slate-900 text-white px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all hover:-translate-y-1">Create New Listing</button>
          )}
        </div>

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {products.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-4">No SKUs in local node</p>
                <button onClick={() => setShowUpload(true)} className="text-blue-600 font-black underline uppercase text-xs">Initialize first listing</button>
              </div>
            ) : products.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[45px] shadow-sm border border-slate-100 group hover:shadow-xl transition-all relative">
                <div className="h-56 bg-slate-50 rounded-3xl mb-8 flex items-center justify-center p-8 overflow-hidden">
                  <img src={p.imageUrl} className="max-h-full object-contain group-hover:scale-110 transition duration-500" />
                </div>
                <h3 className="font-black text-2xl text-slate-900 mb-2 truncate">{p.name}</h3>
                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Rs. {p.price.toLocaleString()}</p>
                
                <div className="flex gap-4 pt-6 border-t border-slate-50">
                  <button onClick={() => startEdit(p)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition">Edit</button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-12 lg:p-20 rounded-[60px] max-w-4xl shadow-sm border border-slate-100">
            <h2 className="text-3xl font-black mb-12 uppercase tracking-tighter">Store Configuration</h2>
            <form onSubmit={handleUpdateSettings} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Display Name</label>
                  <input className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Order WhatsApp</label>
                  <input className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none" value={settingsForm.whatsapp} onChange={e => setSettingsForm({...settingsForm, whatsapp: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Store Bio / Description</label>
                <textarea className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none h-40 resize-none" value={settingsForm.desc} onChange={e => setSettingsForm({...settingsForm, desc: e.target.value})} />
              </div>
              <button disabled={isSyncing} className="bg-slate-900 text-white px-12 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-xl">
                {isSyncing ? 'SAVING...' : 'UPDATE SYSTEM CONFIG'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-blue-600 p-10 rounded-[50px] text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Total Revenue</p>
              <h4 className="text-5xl font-black italic tracking-tighter">Rs. 0</h4>
              <p className="mt-6 text-[10px] font-bold">New node. No sales data yet.</p>
            </div>
            <div className="bg-slate-900 p-10 rounded-[50px] text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Live Listings</p>
              <h4 className="text-5xl font-black italic tracking-tighter">{products.length}</h4>
              <p className="mt-6 text-[10px] font-bold">All SKUs synced to grid.</p>
            </div>
            <div className="bg-emerald-500 p-10 rounded-[50px] text-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Customer Reach</p>
              <h4 className="text-5xl font-black italic tracking-tighter">Global</h4>
              <p className="mt-6 text-[10px] font-bold">Shipping enabled to 14 cities.</p>
            </div>
          </div>
        )}
      </main>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[500] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[60px] max-w-2xl w-full animate-slide-up relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setShowUpload(false); setEditingProduct(null); }} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full font-black hover:bg-slate-100">✕</button>
            <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter italic">{editingProduct ? 'Update SKU' : 'New Deployment'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required placeholder="Product Name" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
                <input required placeholder="Price (PKR)" type="number" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} />
              </div>
              <input required placeholder="Image Link (Direct URL)" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none" value={prodForm.img} onChange={e => setProdForm({...prodForm, img: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input placeholder="Size (S, M, L, XL)" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none" value={prodForm.size} onChange={e => setProdForm({...prodForm, size: e.target.value})} />
                <select className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none appearance-none" value={prodForm.cat} onChange={e => setProdForm({...prodForm, cat: e.target.value})}>
                  <option>Fashion</option>
                  <option>Electronics</option>
                  <option>Sports</option>
                  <option>Home</option>
                </select>
              </div>
              <textarea placeholder="Description / Specs" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none h-32" value={prodForm.desc} onChange={e => setProdForm({...prodForm, desc: e.target.value})} />
              <button disabled={isSyncing} className="w-full bg-blue-600 text-white py-8 rounded-[30px] font-black text-xl shadow-2xl hover:bg-slate-900 transition-all">
                {isSyncing ? 'SYNCING NETWORK...' : (editingProduct ? 'CONFIRM CHANGES' : 'PUSH TO MARKETPLACE')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
