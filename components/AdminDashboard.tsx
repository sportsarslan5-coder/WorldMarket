
import React, { useState, useEffect, useRef } from 'react';
import { Shop, Product, Order, AdminNotification } from '../types.ts';
import { api } from '../services/api.ts';

interface AdminDashboardProps {
  notifications: AdminNotification[];
  onRefresh: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ notifications, onRefresh }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState<'sellers' | 'orders' | 'products' | 'notifications'>('orders');
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
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
    if (onRefresh) await onRefresh();
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
      currency: "USD",
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
    if (pass === 'USASHOP2025' || pass === 'PKMART2025') setIsAuthorized(true);
    else alert('Unauthorized Access');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100 animate-fade-in">
          <h1 className="text-xl font-extrabold text-slate-900 mb-8 tracking-tight">USA SHOP <span className="text-blue-600">Admin</span></h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="System Passcode" 
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <button className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition active:scale-95">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col lg:flex-row text-slate-900 font-sans">
      <nav className="w-full lg:w-72 bg-white p-8 flex flex-col h-screen sticky top-0 border-r border-slate-100">
        <div className="text-lg font-extrabold mb-12 tracking-tight">Admin<span className="text-blue-600">Console</span></div>
        <div className="space-y-2 flex-1">
          {[
            { id: 'orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
            { id: 'sellers', label: 'Vendors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'products', label: 'Live SKUs', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'notifications', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}/></svg>
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition mt-auto">Disconnect Session</button>
      </nav>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <header className="flex justify-between items-center mb-12 animate-fade-in">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">{activeTab} Hub</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Real-time management of the commerce grid.</p>
          </div>
          {activeTab === 'products' && (
            <button onClick={() => setShowDeploy(true)} className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-xs hover:bg-blue-600 transition active:scale-95 shadow-lg shadow-slate-200">Deploy Global SKU</button>
          )}
        </header>

        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            {orders.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
                <p className="text-slate-400 font-medium">No order activity logged today.</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className="bg-white border border-slate-100 p-8 rounded-2xl flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md">{o.id}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{o.customerName}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1">{o.customerAddress}</p>
                </div>
                <div className="md:text-right flex flex-col justify-center">
                   <p className="text-2xl font-extrabold text-slate-900 tracking-tight">${o.totalAmount.toLocaleString()}</p>
                   <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Vendor: {o.shopName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {products.map(p => (
              <div key={p.id} className="bg-white border border-slate-100 p-6 rounded-2xl group transition-all hover:shadow-lg">
                <div className="h-40 bg-slate-50 rounded-xl mb-6 p-6 flex items-center justify-center relative overflow-hidden">
                  <img src={p.imageUrl} className="max-h-full object-contain group-hover:scale-110 transition duration-500" />
                  <button onClick={() => api.deleteProduct(p.id).then(loadData)} className="absolute top-4 right-4 bg-white/80 w-8 h-8 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm">✕</button>
                </div>
                <h4 className="font-bold text-base text-slate-900 mb-1 truncate">{p.name}</h4>
                <p className="text-xl font-extrabold text-blue-600 tracking-tight">${p.price.toLocaleString()}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider truncate">{p.sellerName}</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sellers' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
             {shops.map(s => (
               <div key={s.id} className="bg-white border border-slate-100 p-8 rounded-2xl flex justify-between items-center hover:shadow-md transition">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                   <p className="text-blue-500 font-bold text-[10px] uppercase tracking-widest mt-1">/{s.slug}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">Verified Partner</span>
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-fade-in">
            {notifications.map(n => (
              <div key={n.id} className="bg-white border border-slate-100 p-8 rounded-2xl hover:shadow-md transition">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${n.type === 'NEW_ORDER' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {n.type}
                    </span>
                    <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-wider">{new Date(n.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100/50">
                    <p className="text-[10px] font-bold uppercase text-blue-600 mb-2 tracking-widest">Internal Grid Logic</p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{n.content.whatsapp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Deploy SKU Modal - Modern Styling */}
      {showDeploy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-6" onClick={() => setShowDeploy(false)}>
          <div className="bg-white p-10 rounded-3xl max-w-xl w-full relative shadow-2xl border border-slate-100 animate-fade-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDeploy(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Deploy Global SKU</h2>
            <form onSubmit={handleDeploy} className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition bg-slate-50 relative overflow-hidden"
              >
                {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain opacity-50" /> : <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Upload Product Asset</p>}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input required placeholder="Item Title" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={deployForm.name} onChange={e => setDeployForm({...deployForm, name: e.target.value})} />
                 <input required placeholder="MSRP (USD)" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={deployForm.price} onChange={e => setDeployForm({...deployForm, price: e.target.value})} />
              </div>
              <select required className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none appearance-none font-medium text-slate-500" value={deployForm.sellerId} onChange={e => setDeployForm({...deployForm, sellerId: e.target.value})}>
                <option value="">Select Target Merchant</option>
                {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="w-full h-14 bg-slate-900 text-white rounded-full font-bold text-sm shadow-xl hover:bg-blue-600 transition-all active:scale-95">Authorize Deployment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
