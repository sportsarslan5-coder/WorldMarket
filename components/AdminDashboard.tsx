
import React, { useState, useEffect, useRef } from 'react';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const AdminDashboard: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState<'sellers' | 'orders' | 'products'>('orders');
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // SKU Deployment State
  const [showDeploy, setShowDeploy] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deployForm, setDeployForm] = useState({ name: '', price: '', sellerId: '', cat: 'Fashion' });

  const loadData = async () => {
    const [s, o, p] = await Promise.all([
      api.fetchAllShops(),
      api.fetchAllOrders(),
      api.fetchGlobalProducts()
    ]);
    setShops(s);
    setOrders(o);
    setProducts(p);
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
      window.addEventListener('storage', loadData);
      return () => window.removeEventListener('storage', loadData);
    }
  }, [isAuthorized]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedShop = shops.find(s => s.id === deployForm.sellerId);
    if (!selectedShop || !imagePreview) return;

    const newProduct: Product = {
      id: 'PRD-ADM-' + Date.now(),
      sellerId: selectedShop.id,
      sellerName: selectedShop.name,
      name: deployForm.name,
      description: "Admin Verified Global SKU",
      price: Number(deployForm.price),
      currency: "PKR",
      category: deployForm.cat,
      imageUrl: imagePreview,
      stock: 999,
      published: true,
      createdAt: new Date().toISOString()
    };

    await api.uploadProduct(newProduct);
    loadData();
    setShowDeploy(false);
    setImagePreview(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'PKMART2025') setIsAuthorized(true);
    else alert('Unauthorized Access Attempt Logged.');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 p-12 rounded-[50px] border border-white/5 w-full max-w-md text-center">
          <h1 className="text-3xl font-black text-white italic mb-8 tracking-tighter">MASTER_NODE</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="System Credentials" 
              className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 text-white font-black outline-none focus:border-blue-600"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest">Connect to Grid</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-white font-sans">
      <nav className="w-full lg:w-80 bg-slate-900 p-10 flex flex-col h-screen sticky top-0 border-r border-white/5">
        <div className="text-2xl font-black italic mb-20 tracking-tighter">COMMAND_CENTER</div>
        <div className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Order Log ({orders.length})</button>
          <button onClick={() => setActiveTab('sellers')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'sellers' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Sellers ({shops.length})</button>
          <button onClick={() => setActiveTab('products')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Live SKUs ({products.length})</button>
        </div>
        <button onClick={() => window.location.reload()} className="text-slate-600 font-black text-[9px] uppercase tracking-widest hover:text-red-500 transition">Disconnect</button>
      </nav>

      <main className="flex-1 p-8 lg:p-20 overflow-y-auto">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-5xl font-black uppercase tracking-tighter">{activeTab} Stream</h2>
          {activeTab === 'products' && (
            <button onClick={() => setShowDeploy(true)} className="bg-blue-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-500/10">Deploy Global SKU</button>
          )}
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.map(o => (
              <div key={o.id} className="bg-slate-900 border border-white/5 p-10 rounded-[45px] flex flex-col md:flex-row justify-between gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-blue-500 font-black text-xs uppercase tracking-widest">{o.id}</span>
                    <span className="text-slate-500 text-[10px] font-bold">{new Date(o.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-2">{o.customerName}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{o.customerAddress}</p>
                </div>
                <div className="md:text-right">
                   <p className="text-3xl font-black italic">Rs. {o.totalAmount.toLocaleString()}</p>
                   <p className="text-[10px] font-black uppercase text-slate-600 mt-1">Vendor: {o.shopName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid View */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map(p => (
              <div key={p.id} className="bg-slate-900 border border-white/5 p-8 rounded-[40px] group hover:border-blue-500/30 transition">
                <div className="h-40 bg-white/5 rounded-3xl mb-6 p-6 flex items-center justify-center">
                  <img src={p.imageUrl} className="max-h-full object-contain" />
                </div>
                <h4 className="font-black text-xl mb-1 truncate">{p.name}</h4>
                <p className="text-2xl font-black text-blue-500 tracking-tighter">Rs. {p.price.toLocaleString()}</p>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-slate-600">{p.sellerName}</span>
                  <button onClick={() => api.deleteProduct(p.id).then(loadData)} className="text-red-500 hover:scale-110 transition">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sellers' && (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
             {shops.map(s => (
               <div key={s.id} className="bg-slate-900 border border-white/5 p-10 rounded-[45px] flex justify-between items-center">
                 <div>
                   <h3 className="text-2xl font-black mb-2">{s.name}</h3>
                   <p className="text-blue-500 font-black text-[11px] uppercase tracking-widest">Slug: /{s.slug}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/20">LIVE_NODE</span>
                 </div>
               </div>
             ))}
           </div>
        )}
      </main>

      {/* Deploy SKU Modal */}
      {showDeploy && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[500] flex items-center justify-center p-6">
          <div className="bg-slate-900 p-12 rounded-[60px] max-w-2xl w-full relative shadow-2xl border border-white/5">
            <button onClick={() => setShowDeploy(false)} className="absolute top-10 right-10 text-white font-black">✕</button>
            <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter italic">Inject Global SKU</h2>
            <form onSubmit={handleDeploy} className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center cursor-pointer hover:border-blue-500 transition bg-white/5 relative overflow-hidden"
              >
                {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-50" /> : <p className="text-xs font-black uppercase tracking-widest text-slate-500">Select Gallery Image</p>}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <input required placeholder="Item Name" className="w-full p-5 bg-white/5 rounded-2xl outline-none" value={deployForm.name} onChange={e => setDeployForm({...deployForm, name: e.target.value})} />
                 <input required placeholder="Price" className="w-full p-5 bg-white/5 rounded-2xl outline-none" value={deployForm.price} onChange={e => setDeployForm({...deployForm, price: e.target.value})} />
              </div>
              <select required className="w-full p-5 bg-white/5 rounded-2xl outline-none appearance-none" value={deployForm.sellerId} onChange={e => setDeployForm({...deployForm, sellerId: e.target.value})}>
                <option value="">Select Target Vendor Node</option>
                {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Authorize Deployment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
