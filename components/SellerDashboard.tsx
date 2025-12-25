
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shop, Product } from '../types.ts';
import { Link } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const [regForm, setRegForm] = useState({ name: '', whatsapp: '', email: '' });
  const [prodForm, setProdForm] = useState({ name: '', price: '', img: '', size: '', cat: 'Fashion' });

  useEffect(() => {
    const savedId = localStorage.getItem('PK_ACTIVE_SELLER_ID');
    if (savedId) {
      api.fetchAllShops().then(shops => {
        const found = shops.find(s => s.id === savedId);
        if (found) {
          setShop(found);
          api.fetchSellerProducts(found.id).then(setProducts);
        }
      });
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    const newShop = await api.registerSeller(regForm);
    setShop(newShop);
    localStorage.setItem('PK_ACTIVE_SELLER_ID', newShop.id);
    setIsSyncing(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setIsSyncing(true);
    
    const product: Product = {
      id: 'PRD-' + Date.now(),
      sellerId: shop.id,
      sellerName: shop.name,
      name: prodForm.name,
      description: "Premium Quality Global SKU",
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
    const updated = await api.fetchSellerProducts(shop.id);
    setProducts(updated);
    setShowUpload(false);
    setIsSyncing(false);
    setProdForm({ name: '', price: '', img: '', size: '', cat: 'Fashion' });
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-xl p-12 md:p-16 rounded-[60px] shadow-2xl animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2 italic">PK-MART SELLER</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Connect your inventory to the global grid</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Business Name</label>
              <input required placeholder="e.g. Lahore Trends" className="w-full p-6 bg-slate-50 rounded-3xl font-black text-lg outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">WhatsApp Number</label>
                <input required placeholder="03001234567" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.whatsapp} onChange={e => setRegForm({...regForm, whatsapp: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Email Node</label>
                <input required type="email" placeholder="vendor@pk.com" className="w-full p-6 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
              </div>
            </div>

            <button disabled={isSyncing} className="w-full bg-slate-900 text-white py-8 rounded-[30px] font-black text-xl shadow-2xl active:scale-95 transition-all hover:bg-blue-600">
              {isSyncing ? 'ACTIVATING NODE...' : 'LAUNCH MY ONLINE STORE'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 bg-slate-900 text-white p-10 flex flex-col h-screen sticky top-0">
        <div className="text-2xl font-black italic mb-20 tracking-tighter">VENDOR_HUB</div>
        <div className="space-y-4 flex-1">
          <Link to={`/shop/${shop.slug}`} target="_blank" className="block w-full text-center p-5 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition">View Live Store</Link>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Network ID</p>
            <p className="font-mono text-[10px] text-emerald-400 truncate">{shop.id}</p>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('PK_ACTIVE_SELLER_ID'); window.location.reload(); }} className="text-slate-600 font-black text-[10px] uppercase hover:text-red-500 transition">Log Out</button>
      </aside>

      <main className="flex-1 p-8 lg:p-20 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-20">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900 leading-[0.8] mb-4">{shop.name}</h1>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Master Inventory System</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="bg-slate-900 text-white px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all hover:-translate-y-1">Add New SKU</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {products.length === 0 ? (
            <div className="col-span-full py-40 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No SKUs deployed to network</p>
            </div>
          ) : products.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[45px] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
              <div className="h-56 bg-slate-50 rounded-3xl mb-8 flex items-center justify-center p-8 overflow-hidden">
                <img src={p.imageUrl} className="max-h-full object-contain group-hover:scale-110 transition duration-500" />
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-2">{p.name}</h3>
              <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Rs. {p.price.toLocaleString()}</p>
              <div className="flex gap-2">
                <span className="bg-slate-50 px-3 py-1 rounded-full text-[9px] font-black uppercase text-slate-400 border border-slate-100">Stock: 99+</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[500] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[60px] max-w-2xl w-full animate-slide-up relative shadow-2xl">
            <button onClick={() => setShowUpload(false)} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full font-black hover:bg-slate-100">✕</button>
            <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter italic">Deploy SKU</h2>
            <form onSubmit={handleUpload} className="space-y-6">
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
              <button disabled={isSyncing} className="w-full bg-blue-600 text-white py-8 rounded-[30px] font-black text-xl shadow-2xl hover:bg-slate-900 transition-all">
                {isSyncing ? 'SYNCING...' : 'BROADCAST TO NETWORK'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
