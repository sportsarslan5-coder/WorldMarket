
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shop, ShopStatus, Product, PayoutInfo } from '../types.ts';
import { Link } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const [step, setStep] = useState<'register' | 'otp' | 'pending' | 'active'>('register');
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    whatsapp: '', 
    category: 'Fashion',
    payoutInfo: {
      method: 'JazzCash',
      accountNumber: '',
      accountTitle: ''
    } as PayoutInfo
  });
  const [otpInput, setOtpInput] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('pk_current_shop_id');
    if (savedId) {
      api.fetchAllShops().then(all => {
        const found = all.find(s => s.id === savedId);
        if (found) {
          setShop(found);
          syncStep(found.status);
          if (found.status === ShopStatus.ACTIVE) {
            api.fetchProductsByShop(found.id).then(setProducts);
          }
        }
      });
    }
  }, []);

  const syncStep = (status: ShopStatus) => {
    if (status === ShopStatus.PENDING_VERIFICATION) setStep('otp');
    else if (status === ShopStatus.PENDING_ADMIN_APPROVAL) setStep('pending');
    else if (status === ShopStatus.ACTIVE) setStep('active');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newShop = await api.createShop(formData);
    setShop(newShop);
    localStorage.setItem('pk_current_shop_id', newShop.id);
    setStep('otp');
    setLoading(false);
    alert(`Code sent to ${formData.whatsapp}. (Debug Code: ${newShop.otpCode})`);
  };

  const handleVerifyOTP = async () => {
    if (!shop) return;
    const success = await api.verifyOTP(shop.id, otpInput);
    if (success) {
      setStep('pending');
    } else {
      alert("Invalid OTP.");
    }
  };

  if (step === 'register') {
    return (
      <div className="min-h-screen bg-[#131921] flex items-center justify-center p-6 py-12">
        <div className="bg-white max-w-2xl w-full p-12 rounded-[40px] shadow-2xl">
          <h2 className="text-4xl font-black italic uppercase mb-2 tracking-tighter">Vendor Onboarding</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10">Step 1: Business Identity & Payouts</p>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Shop Name</label>
                <input required placeholder="Arslan Sports" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl outline-none font-bold transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Category</label>
                <select className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Fashion</option>
                  <option>Electronics</option>
                  <option>Sports</option>
                  <option>Home</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email</label>
                <input required type="email" placeholder="contact@shop.pk" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">WhatsApp</label>
                <input required placeholder="03001234567" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl space-y-4 border border-slate-100">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Payout Settlement Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="p-4 bg-white border rounded-xl font-bold text-sm" value={formData.payoutInfo.method} onChange={e => setFormData({...formData, payoutInfo: {...formData.payoutInfo, method: e.target.value as any}})}>
                    <option>JazzCash</option>
                    <option>Easypaisa</option>
                    <option>Bank</option>
                  </select>
                  <input placeholder="Account Title" className="md:col-span-2 p-4 bg-white border rounded-xl font-bold text-sm" value={formData.payoutInfo.accountTitle} onChange={e => setFormData({...formData, payoutInfo: {...formData.payoutInfo, accountTitle: e.target.value}})} />
                  <input placeholder="Account Number" className="md:col-span-3 p-4 bg-white border rounded-xl font-bold text-sm" value={formData.payoutInfo.accountNumber} onChange={e => setFormData({...formData, payoutInfo: {...formData.payoutInfo, accountNumber: e.target.value}})} />
               </div>
            </div>

            <button disabled={loading} className="w-full bg-[#febd69] py-6 rounded-3xl font-black text-xl shadow-xl hover:translate-y-[-2px] transition active:scale-95">
              {loading ? 'Submitting...' : 'Register & Send OTP'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-[#131921] flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full p-12 rounded-[40px] text-center shadow-2xl">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-8">📱</div>
          <h2 className="text-3xl font-black mb-4">Verification</h2>
          <p className="text-slate-400 text-sm mb-10">We sent a 6-digit code to <strong>{shop?.whatsappNumber}</strong></p>
          <input maxLength={6} className="w-full text-center text-5xl font-black tracking-[0.4em] p-6 bg-slate-50 rounded-3xl mb-8 outline-none border-4 border-transparent focus:border-[#febd69] transition" value={otpInput} onChange={e => setOtpInput(e.target.value)} />
          <button onClick={handleVerifyOTP} className="w-full bg-[#febd69] py-6 rounded-3xl font-black text-lg">Verify OTP</button>
        </div>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-5xl mb-10 shadow-inner">✓</div>
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Awaiting Approval</h2>
        <p className="text-slate-500 max-w-lg font-medium text-lg leading-relaxed">
          Identity verified. Your shop <strong>{shop?.name}</strong> is now in the Admin Approval queue. 
          Slug <strong>/shop/{shop?.slug}</strong> will be activated once verified.
        </p>
        <div className="mt-12 flex gap-4">
           <Link to="/" className="bg-white border-2 border-slate-200 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Back to Market</Link>
           <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Check Status</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex">
      <aside className="w-80 bg-[#131921] text-white p-10 flex flex-col">
        <h2 className="text-2xl font-black italic mb-16 tracking-tighter">PK-VENDORS</h2>
        <nav className="space-y-6 flex-1">
          <button className="w-full text-left p-5 bg-white/10 rounded-2xl font-bold flex items-center gap-4">
            <span className="w-2 h-2 bg-[#febd69] rounded-full"></span> Inventory
          </button>
          <button className="w-full text-left p-5 text-slate-500 font-bold hover:text-white transition">Orders</button>
          <button className="w-full text-left p-5 text-slate-500 font-bold hover:text-white transition">Settings</button>
        </nav>
        <div className="pt-10 border-t border-white/5 space-y-4">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Storefront URL</p>
          <Link to={`/shop/${shop?.slug}`} className="text-blue-400 font-bold block truncate hover:underline">/shop/{shop?.slug}</Link>
        </div>
      </aside>

      <main className="flex-1 p-16">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">{shop?.name}</h1>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mt-2">{shop?.category} • Global Node {shop?.id.slice(-4)}</p>
          </div>
          <button onClick={() => setShowProductModal(true)} className="bg-[#febd69] px-10 py-5 rounded-[25px] font-black text-slate-900 shadow-xl shadow-amber-200 active:scale-95 transition">Add New SKU</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {products.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-2xl transition duration-500">
              <div className="h-56 bg-slate-50 rounded-[30px] mb-8 overflow-hidden p-6 relative">
                <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition duration-700" alt="" />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Active</div>
              </div>
              <h3 className="font-bold text-xl mb-4 line-clamp-1">{p.name}</h3>
              <div className="flex justify-between items-center">
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {p.price.toLocaleString()}</p>
                 <span className="text-[10px] font-black uppercase text-slate-300">Stock: {p.stock}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full bg-white p-24 rounded-[50px] text-center border-4 border-dashed border-slate-100">
               <p className="text-slate-300 font-black text-sm uppercase tracking-[0.2em]">Inventory empty. Add your first product.</p>
            </div>
          )}
        </div>
      </main>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl p-16 rounded-[60px] shadow-2xl relative overflow-hidden">
            <h2 className="text-4xl font-black mb-10 italic uppercase">New Master Listing</h2>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <input placeholder="Product Title" className="col-span-2 p-5 bg-slate-50 rounded-2xl font-bold" id="p-name" />
              <input type="number" placeholder="Price (PKR)" className="p-5 bg-slate-50 rounded-2xl font-bold" id="p-price" />
              <input type="number" placeholder="Initial Stock" className="p-5 bg-slate-50 rounded-2xl font-bold" id="p-stock" />
              <input placeholder="Primary Image URL" className="col-span-2 p-5 bg-slate-50 rounded-2xl font-bold" id="p-img" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowProductModal(false)} className="flex-1 py-5 rounded-3xl font-black text-slate-400 hover:bg-slate-50 transition">Discard</button>
              <button onClick={async () => {
                const name = (document.getElementById('p-name') as HTMLInputElement).value;
                const price = Number((document.getElementById('p-price') as HTMLInputElement).value);
                const stock = Number((document.getElementById('p-stock') as HTMLInputElement).value);
                const img = (document.getElementById('p-img') as HTMLInputElement).value;
                if (!name || !shop) return;
                
                await api.saveProduct({
                  id: 'sku_' + Date.now(),
                  shopId: shop.id,
                  name, price, stock, imageUrl: img,
                  description: '', category: shop.category,
                  images: [], sizes: ['M', 'L', 'XL'], colors: ['Default'],
                  published: true, createdAt: new Date().toISOString()
                });
                
                const updated = await api.fetchProductsByShop(shop.id);
                setProducts(updated);
                setShowProductModal(false);
              }} className="flex-1 py-5 bg-[#febd69] rounded-3xl font-black text-lg shadow-xl shadow-amber-100">Deploy Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
