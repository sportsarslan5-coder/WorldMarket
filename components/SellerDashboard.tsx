
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shop, ShopStatus, Product, PayoutInfo } from '../types.ts';
import { Link } from 'react-router-dom';

const SellerDashboard: React.FC<{onNotify?: any}> = ({ onNotify }) => {
  const [step, setStep] = useState<'register' | 'activate' | 'active'>('register');
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSKUModal, setShowSKUModal] = useState(false);
  
  const [regData, setRegData] = useState({ 
    name: '', email: '', whatsapp: '', category: 'Fashion',
    payoutInfo: { method: 'JazzCash', accountNumber: '', accountTitle: '' } as PayoutInfo
  });

  const [skuData, setSkuData] = useState({
    name: '', price: '', stock: '', img: '', sizes: 'S,M,L,XL', colors: 'Black,White'
  });

  useEffect(() => {
    const authId = localStorage.getItem('PK_MART_SELLER_TOKEN');
    if (authId) {
      api.fetchAllShops().then(all => {
        const found = all.find(s => s.id === authId);
        if (found) {
          setShop(found);
          if (found.status === ShopStatus.ACTIVE) {
            setStep('active');
            api.fetchProductsBySeller(found.id).then(setProducts);
          } else {
            setStep('activate');
          }
        }
      });
    }
  }, []);

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    const created = await api.createShop(regData);
    setShop(created);
    localStorage.setItem('PK_MART_SELLER_TOKEN', created.id);
    if (onNotify) onNotify('NEW_SELLER', created);
    setStep('activate');
    setIsSyncing(false);
  };

  const onActivate = async () => {
    if (!shop) return;
    setIsSyncing(true);
    const success = await api.activateVendorSite(otpCode, shop.id);
    if (success) {
      setStep('active');
      const updatedShop = await api.fetchShopBySlug(shop.slug);
      setShop(updatedShop);
      api.fetchProductsBySeller(shop.id).then(setProducts);
    } else {
      alert("Invalid Activation Key. Reach out to Admin.");
    }
    setIsSyncing(false);
  };

  const uploadSKU = async () => {
    if (!shop) return;
    setIsSyncing(true);
    const p: Product = {
      id: 'SKU-' + Date.now(),
      sellerId: shop.id, // THE FIX: STRICT ISOLATION
      name: skuData.name,
      description: 'Authentic PK-MART Global Supply SKU.',
      price: Number(skuData.price),
      currency: 'PKR',
      category: shop.category,
      imageUrl: skuData.img || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      images: [],
      sizes: skuData.sizes.split(',').map(s => s.trim()),
      colors: skuData.colors.split(',').map(c => c.trim()),
      stock: Number(skuData.stock),
      published: true,
      createdAt: new Date().toISOString()
    };
    await api.saveProduct(p);
    const refreshed = await api.fetchProductsBySeller(shop.id);
    setProducts(refreshed);
    setShowSKUModal(false);
    setIsSyncing(false);
  };

  if (step === 'register') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white max-w-2xl w-full p-12 md:p-16 rounded-[60px] animate-slide-up">
          <h2 className="text-4xl font-black uppercase mb-2 tracking-tighter text-slate-900">Start Selling</h2>
          <p className="text-slate-400 font-bold mb-10 text-sm uppercase tracking-widest">Initialize Global Vendor Node</p>
          <form onSubmit={onRegister} className="space-y-4">
            <input required placeholder="Full Shop Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
            <input required placeholder="Contact Email" type="email" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
            <input required placeholder="WhatsApp Number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={regData.whatsapp} onChange={e => setRegData({...regData, whatsapp: e.target.value})} />
            <button disabled={isSyncing} className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black text-xl uppercase tracking-widest mt-6 hover:bg-blue-600 transition shadow-xl">
               {isSyncing ? 'Syncing...' : 'Begin Onboarding'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'activate') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 p-16 rounded-[60px] max-w-xl w-full text-center border border-white/5 shadow-2xl">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
           </div>
           <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Enter Command Key</h2>
           <p className="text-slate-500 font-bold mb-12 uppercase text-[10px] tracking-[0.2em]">Contact Master Admin for your 6-digit site key</p>
           <input 
              maxLength={6}
              className="w-full p-10 bg-black rounded-3xl text-blue-500 font-black text-6xl text-center outline-none border-4 border-transparent focus:border-blue-600 transition tracking-[0.3em]"
              value={otpCode} onChange={e => setOtpCode(e.target.value.toUpperCase())}
           />
           <button 
              disabled={isSyncing || otpCode.length < 6}
              onClick={onActivate}
              className="w-full bg-blue-600 text-white py-6 rounded-[30px] font-black text-xl mt-12 hover:shadow-2xl hover:shadow-blue-500/30 disabled:opacity-30 transition"
           >
              {isSyncing ? 'Validating...' : 'UNLOCK LIVE STORE'}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-80 bg-slate-900 text-white p-10 flex flex-col sticky top-0 h-screen">
         <div className="text-2xl font-black italic tracking-tighter mb-20 flex items-center gap-3">
            <div className="bg-emerald-500 w-8 h-8 rounded-lg"></div> VENDOR_NODE
         </div>
         <nav className="space-y-4 flex-1">
            <button className="w-full text-left p-5 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Warehouse View</button>
            <Link to="/" className="w-full block p-5 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition">Marketplace Hub</Link>
         </nav>
         <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Global Link</p>
            <Link to={`/shop/${shop?.slug}`} className="text-blue-400 font-bold text-xs truncate block hover:text-white transition">pkmart.pk/{shop?.slug}</Link>
         </div>
      </aside>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
         <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 rounded-full">Active Site</span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Node ID: {shop?.id}</span>
               </div>
               <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900">{shop?.name}</h1>
            </div>
            <button onClick={() => setShowSKUModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition">Deploy New SKU</button>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.length === 0 ? (
               <div className="col-span-full py-40 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase text-sm tracking-widest">Warehouse is empty</p>
               </div>
            ) : products.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-xl transition flex flex-col">
                 <div className="h-64 bg-slate-50 rounded-[30px] p-8 mb-6 flex items-center justify-center overflow-hidden">
                    <img src={p.imageUrl} className="max-h-full max-w-full object-contain group-hover:scale-110 transition" alt="p" />
                 </div>
                 <h3 className="font-bold text-xl mb-2 text-slate-900 line-clamp-1">{p.name}</h3>
                 <p className="text-3xl font-black text-slate-900">Rs. {p.price.toLocaleString()}</p>
                 <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Stock: {p.stock}</span>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Live On Grid</span>
                 </div>
              </div>
            ))}
         </div>
      </main>

      {showSKUModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[400] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl p-12 md:p-16 rounded-[60px] relative shadow-2xl animate-slide-up">
              <button onClick={() => setShowSKUModal(false)} className="absolute top-10 right-10 w-10 h-10 flex items-center justify-center font-black">✕</button>
              <h2 className="text-4xl font-black mb-1 text-slate-900 uppercase tracking-tighter">Global SKU Deployment</h2>
              <p className="text-slate-400 font-bold mb-10 text-xs uppercase tracking-widest">Inventory will sync across all mobile devices</p>
              <div className="space-y-4">
                 <input placeholder="Product Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={skuData.name} onChange={e => setSkuData({...skuData, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Price (PKR)" className="p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={skuData.price} onChange={e => setSkuData({...skuData, price: e.target.value})} />
                    <input placeholder="Stock Quantity" className="p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={skuData.stock} onChange={e => setSkuData({...skuData, stock: e.target.value})} />
                 </div>
                 <input placeholder="Product Image URL" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={skuData.img} onChange={e => setSkuData({...skuData, img: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Sizes (e.g. S,M,L)" className="p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={skuData.sizes} onChange={e => setSkuData({...skuData, sizes: e.target.value})} />
                    <input placeholder="Colors (e.g. Red,Blue)" className="p-5 bg-slate-50 rounded-2xl font-bold border border-transparent focus:border-blue-500 outline-none" value={skuData.colors} onChange={e => setSkuData({...skuData, colors: e.target.value})} />
                 </div>
                 <button onClick={uploadSKU} disabled={isSyncing} className="w-full py-8 bg-blue-600 text-white rounded-[40px] font-black uppercase text-xl mt-8 shadow-xl shadow-blue-500/20 active:scale-95 transition">
                    {isSyncing ? 'Deploying...' : 'SYNC TO WORLD GRID'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
