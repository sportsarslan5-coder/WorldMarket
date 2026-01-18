
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.ts';
import { Shop, Product } from '../types.ts';
import { Link } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings' | 'performance'>('inventory');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  
  const [regForm, setRegForm] = useState({ name: '', whatsapp: '', email: '' });
  const [prodForm, setProdForm] = useState({ name: '', price: '', size: '', cat: 'Fashion', desc: '' });

  useEffect(() => {
    const savedId = localStorage.getItem('USA_ACTIVE_SELLER_ID');
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
    setSyncStatus('Broadcasting Registration...');
    try {
      const newShop = await api.registerSeller(regForm);
      localStorage.setItem('USA_ACTIVE_SELLER_ID', newShop.id);
      setShop(newShop);
      setProducts([]); 
    } catch (err) {
      console.error("Registration failed:", err);
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
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
    if (!shop || (!imagePreview && !editingProduct)) return;
    
    setIsSyncing(true);
    setSyncStatus('Deploying to Global Mobile Grid...');

    const finalImageUrl = imagePreview || (editingProduct ? editingProduct.imageUrl : '');

    const product: Product = {
      id: editingProduct ? editingProduct.id : 'PRD-' + Date.now(),
      sellerId: shop.id,
      sellerName: shop.name,
      name: prodForm.name,
      description: prodForm.desc || "Premium Quality Global SKU",
      price: Number(prodForm.price),
      currency: "USD",
      category: prodForm.cat,
      imageUrl: finalImageUrl,
      size: prodForm.size,
      stock: 99,
      published: true,
      createdAt: new Date().toISOString()
    };

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, product);
    } else {
      await api.uploadProduct(product);
    }

    // Simulate Network Latency for the "Global Sync" feel
    await new Promise(r => setTimeout(r, 1500));

    await loadShopData(shop.id);
    setShowUpload(false);
    setEditingProduct(null);
    setImagePreview(null);
    setIsSyncing(false);
    setSyncStatus('');
    setProdForm({ name: '', price: '', size: '', cat: 'Fashion', desc: '' });
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      price: p.price.toString(),
      size: p.size || '',
      cat: p.category,
      desc: p.description
    });
    setImagePreview(p.imageUrl);
    setShowUpload(true);
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-xl border border-slate-100 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Vendor Launchpad</h2>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Connect your brand to the grid</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <input required placeholder="Business Name" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
            <input required placeholder="WhatsApp Number" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={regForm.whatsapp} onChange={e => setRegForm({...regForm, whatsapp: e.target.value})} />
            <input required type="email" placeholder="Email Address" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />

            <button disabled={isSyncing} className="w-full h-14 bg-slate-900 text-white rounded-full font-bold text-sm shadow-xl shadow-slate-200 hover:bg-blue-600 transition disabled:opacity-50">
              {isSyncing ? 'Synchronizing...' : 'Launch Merchant Store'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col lg:flex-row font-sans">
      <aside className="w-full lg:w-72 bg-white border-r border-slate-100 p-8 flex flex-col h-screen sticky top-0">
        <div className="text-lg font-extrabold mb-12 tracking-tight">Merchant<span className="text-blue-600">Console</span></div>
        <div className="space-y-1 flex-1">
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'inventory' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>Inventory</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>Settings</button>
          <div className="pt-8">
            <Link to={`/shop/${shop.slug}`} target="_blank" className="block w-full text-center py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition border border-blue-100/50">View Live Store</Link>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('USA_ACTIVE_SELLER_ID'); window.location.reload(); }} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition mt-auto">Disconnect Node</button>
      </aside>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 animate-fade-in">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{shop.name}</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Global ID: {shop.id}</p>
          </div>
          <button onClick={() => { setEditingProduct(null); setImagePreview(null); setProdForm({ name: '', price: '', size: '', cat: 'Fashion', desc: '' }); setShowUpload(true); }} className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-xs hover:bg-blue-600 transition shadow-lg shadow-slate-200 active:scale-95">Deploy New SKU</button>
        </header>

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 font-bold text-sm">No products live on grid.</p>
                <button onClick={() => setShowUpload(true)} className="text-blue-600 font-bold text-xs mt-4 hover:underline">Launch your first deployment</button>
              </div>
            ) : products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 group transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-square bg-slate-50 rounded-2xl mb-6 p-10 flex items-center justify-center overflow-hidden">
                  <img src={p.imageUrl} className="max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-1 truncate">{p.name}</h3>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight mb-6">${p.price.toLocaleString()}</p>
                
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-[11px] text-slate-600 hover:bg-slate-900 hover:text-white transition">Edit</button>
                  <button onClick={() => api.deleteProduct(p.id).then(() => loadShopData(shop.id))} className="flex-1 py-2.5 bg-red-50 rounded-xl font-bold text-[11px] text-red-600 hover:bg-red-600 hover:text-white transition">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-6" onClick={() => !isSyncing && setShowUpload(false)}>
          <div className="bg-white p-10 rounded-3xl max-w-xl w-full animate-fade-in relative shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {isSyncing ? (
              <div className="py-20 flex flex-col items-center text-center space-y-8 animate-fade-in">
                 <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                 <div>
                   <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{syncStatus}</h3>
                   <p className="text-slate-500 text-sm font-medium mt-2">Sending asset packets to every mobile node...</p>
                 </div>
                 <div className="w-full max-w-[200px] h-1 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                 </div>
              </div>
            ) : (
              <>
                <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
                <h2 className="text-2xl font-extrabold mb-8 tracking-tight">{editingProduct ? 'Edit Deployment' : 'Global SKU Deployment'}</h2>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition bg-slate-50 relative overflow-hidden"
                  >
                    {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain opacity-40" alt="Preview" /> : <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Product Asset</p>}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Item Title" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
                    <input required placeholder="MSRP (USD)" type="number" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} />
                  </div>
                  <textarea placeholder="Product Description" className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium resize-none" value={prodForm.desc} onChange={e => setProdForm({...prodForm, desc: e.target.value})} />
                  <button className="w-full h-14 bg-slate-900 text-white rounded-full font-bold text-sm shadow-xl shadow-slate-100 hover:bg-blue-600 transition-all active:scale-95">Deploy to Every Mobile</button>
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
