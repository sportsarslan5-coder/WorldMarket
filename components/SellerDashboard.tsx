
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
  const [prodForm, setProdForm] = useState({ name: '', price: '', img: '', size: '' });

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
    if (!regForm.name || !regForm.whatsapp || !regForm.email) return;
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
      description: "Premium SKU",
      price: Number(prodForm.price),
      currency: "PKR",
      category: "General",
      imageUrl: prodForm.img || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      images: [],
      sizes: prodForm.size ? [prodForm.size] : [],
      colors: [],
      stock: 99,
      published: true,
      createdAt: new Date().toISOString()
    };

    await api.uploadProduct(product);
    const updated = await api.fetchSellerProducts(shop.id);
    setProducts(updated);
    setShowUpload(false);
    setIsSyncing(false);
  };

  const isRegValid = regForm.name.length > 2 && regForm.whatsapp.length > 9 && regForm.email.includes('@');

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg p-10 md:p-14 rounded-[50px] shadow-2xl animate-slide-up">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">Create Your Website</h2>
            <p className="text-slate-500 font-bold text-sm">Join the PK-MART Seller Network Instantly</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
               <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Shop Name</label>
               <input required placeholder="e.g. Ali's Fashion Hub" className="w-full p-5 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">WhatsApp Number</label>
               <input required placeholder="03001234567" className="w-full p-5 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.whatsapp} onChange={e => setRegForm({...regForm, whatsapp: e.target.value})} />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block tracking-widest">Email Address</label>
               <input required placeholder="name@example.com" type="email" className="w-full p-5 bg-slate-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
            </div>

            <div className="pt-6">
              <button 
                id="create-website-btn"
                disabled={!isRegValid || isSyncing} 
                className={`w-full py-6 rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
                  ${isRegValid ? 'bg-blue-600 text-white hover:bg-slate-900 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {isSyncing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    CREATING NODE...
                  </>
                ) : (
                  'CREATE MY WEBSITE NOW'
                )}
              </button>
            </div>
            
            <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">By clicking, you send your profile to the master node.</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 bg-slate-900 text-white p-10 flex flex-col h-screen sticky top-0">
        <div className="text-2xl font-black italic mb-20 tracking-tighter">VENDOR_HUB</div>
        <div className="space-y-4 flex-1">
          <div className="p-5 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Inventory Node</div>
          <Link to={`/shop/${shop.slug}`} className="block p-5 text-emerald-400 font-black text-[10px] uppercase border border-emerald-400/20 rounded-2xl text-center hover:bg-emerald-400 hover:text-white transition">Visit Live Shop</Link>
          <Link to="/" className="block p-5 text-slate-500 font-black text-[10px] uppercase hover:text-white transition">Marketplace Hub</Link>
        </div>
        <button onClick={() => { localStorage.removeItem('PK_ACTIVE_SELLER_ID'); window.location.reload(); }} className="text-slate-600 font-black text-[10px] uppercase hover:text-red-500 transition">Logout Account</button>
      </aside>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900">{shop.name}</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Active Since: {new Date(shop.joinedAt).toLocaleDateString()}</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition">Add New Product</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {products.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest text-sm">No SKUs uploaded to node</div>
          ) : products.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-xl transition">
              <div className="h-48 bg-slate-50 rounded-3xl mb-6 flex items-center justify-center p-6 overflow-hidden">
                <img src={p.imageUrl} className="max-h-full object-contain group-hover:scale-110 transition duration-500" alt="p" />
              </div>
              <h3 className="font-black text-xl mb-2 text-slate-900">{p.name}</h3>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {p.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[50px] max-w-xl w-full animate-slide-up relative shadow-2xl">
            <button onClick={() => setShowUpload(false)} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full font-black hover:bg-slate-100">✕</button>
            <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">Upload SKU</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input required placeholder="Product Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} />
              <input required placeholder="Price (PKR)" type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} />
              <input required placeholder="Image URL (High Quality)" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={prodForm.img} onChange={e => setProdForm({...prodForm, img: e.target.value})} />
              <input placeholder="Size / Variant (Optional)" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={prodForm.size} onChange={e => setProdForm({...prodForm, size: e.target.value})} />
              <button disabled={isSyncing} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-slate-900 transition mt-6">
                {isSyncing ? 'DEPLOYING SKU...' : 'PUSH TO ALL DEVICES'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
