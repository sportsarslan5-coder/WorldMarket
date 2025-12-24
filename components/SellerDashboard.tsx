
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shop, ShopStatus, Product, PayoutInfo } from '../types.ts';
import { Link } from 'react-router-dom';

interface SellerDashboardProps {
  onNotify?: (type: 'NEW_SELLER' | 'NEW_ORDER', data: any) => Promise<void>;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ onNotify }) => {
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
    try {
      const newShop = await api.createShop(formData);
      setShop(newShop);
      localStorage.setItem('pk_current_shop_id', newShop.id);
      
      if (onNotify) {
        await onNotify('NEW_SELLER', {
          id: newShop.ownerId,
          fullName: newShop.name,
          email: newShop.email,
          phoneNumber: newShop.whatsappNumber,
          payoutInfo: newShop.payoutInfo
        });
      }

      setStep('otp');
    } catch (err) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!shop) return;
    const success = await api.verifyOTP(shop.id, otpInput);
    if (success) {
      const updatedShops = await api.fetchAllShops();
      const updatedShop = updatedShops.find(s => s.id === shop.id);
      if (updatedShop) setShop(updatedShop);
      setStep('pending');
    } else {
      alert("Invalid OTP. Try '000000' for testing.");
    }
  };

  if (step === 'register') {
    return (
      <div className="min-h-screen bg-[#131921] flex items-center justify-center p-6 py-12">
        <div className="bg-white max-w-2xl w-full p-12 rounded-[40px] shadow-2xl">
          <h2 className="text-4xl font-black italic uppercase mb-2 tracking-tighter">Vendor Onboarding</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-10">Business Identity & Payouts</p>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required placeholder="Shop Name" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl outline-none font-bold transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Fashion</option>
                <option>Electronics</option>
                <option>Sports</option>
                <option>Home</option>
              </select>
              <input required type="email" placeholder="Email" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required placeholder="WhatsApp" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl space-y-4 border border-slate-100">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Payout Details (For Monthly Settlements)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="p-4 bg-white border rounded-xl font-bold text-sm" value={formData.payoutInfo.method} onChange={e => setFormData({...formData, payoutInfo: {...formData.payoutInfo, method: e.target.value as any}})}>
                    <option>JazzCash</option>
                    <option>Easypaisa</option>
                    <option>Bank</option>
                  </select>
                  <input placeholder="Account Title" className="p-4 bg-white border rounded-xl font-bold text-sm" value={formData.payoutInfo.accountTitle} onChange={e => setFormData({...formData, payoutInfo: {...formData.payoutInfo, accountTitle: e.target.value}})} />
                  <input placeholder="Account Number" className="md:col-span-2 p-4 bg-white border rounded-xl font-bold text-sm" value={formData.payoutInfo.accountNumber} onChange={e => setFormData({...formData, payoutInfo: {...formData.payoutInfo, accountNumber: e.target.value}})} />
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
        <div className="bg-white max-w-md w-full p-12 rounded-[40px] text-center shadow-2xl relative overflow-hidden">
          {/* Simulated SMS Notification for UX */}
          <div className="absolute top-0 inset-x-0 bg-emerald-500 text-white p-3 text-[10px] font-black uppercase tracking-widest animate-bounce">
            SIMULATED SMS: YOUR OTP IS {shop?.otpCode}
          </div>
          
          <h2 className="text-3xl font-black mb-4 mt-4">Verification</h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed">
            We've sent a 6-digit code to <br/><strong className="text-slate-900">{shop?.whatsappNumber}</strong>
          </p>
          
          <input 
            maxLength={6} 
            className="w-full text-center text-5xl font-black tracking-[0.4em] p-6 bg-slate-50 rounded-3xl mb-4 outline-none border-4 border-transparent focus:border-[#febd69]" 
            value={otpInput} 
            placeholder="000000"
            onChange={e => setOtpInput(e.target.value)} 
          />
          <p className="text-[9px] font-black text-slate-300 uppercase mb-8">Hint: Use {shop?.otpCode} or 000000</p>
          
          <button onClick={handleVerifyOTP} className="w-full bg-[#febd69] py-6 rounded-3xl font-black text-lg active:scale-95 transition">
            Verify & Continue
          </button>
          
          <button onClick={() => setStep('register')} className="mt-6 text-slate-400 text-[10px] font-black uppercase hover:text-slate-600 transition">
            Wrong Number? Edit Details
          </button>
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
          Identity verified. Your shop <strong>{shop?.name}</strong> is currently being reviewed by the PK-MART master node. 
          <br/><br/>
          Public Link: <span className="text-blue-600 font-bold">/shop/{shop?.slug}</span>
        </p>
        <div className="mt-12 flex gap-4">
           <Link to="/" className="bg-white border-2 border-slate-200 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition">Market</Link>
           <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition">Check Status</button>
        </div>
        <p className="mt-10 text-[10px] font-black text-slate-300 uppercase">Pro Tip: Use Master Code PK-MART-9988 in Admin to approve yourself.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-[#131921] text-white p-10 flex flex-col">
        <h2 className="text-2xl font-black italic mb-16 tracking-tighter text-[#febd69]">PK-VENDORS</h2>
        <nav className="space-y-6 flex-1">
          <button className="w-full text-left p-5 bg-white/10 rounded-2xl font-bold border-l-4 border-[#febd69]">Inventory</button>
          <button className="w-full text-left p-5 text-slate-500 font-bold hover:text-white transition">Orders</button>
          <button className="w-full text-left p-5 text-slate-500 font-bold hover:text-white transition">Analytics</button>
          <button className="w-full text-left p-5 text-slate-500 font-bold hover:text-white transition">Payouts</button>
        </nav>
        <div className="pt-10 border-t border-white/5">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Live Storefront</p>
          <Link to={`/shop/${shop?.slug}`} className="text-[#febd69] font-bold block truncate hover:underline">/shop/{shop?.slug}</Link>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-16 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">{shop?.name}</h1>
            <p className="text-slate-400 font-black text-xs uppercase mt-2">{shop?.category} • Node ID: {shop?.id.slice(-6).toUpperCase()}</p>
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
                 <span className="text-[10px] font-black text-slate-400 uppercase">Stock: {p.stock}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full bg-white p-24 rounded-[50px] text-center border-4 border-dashed border-slate-100">
               <div className="text-4xl mb-4">📦</div>
               <p className="text-slate-300 font-black text-sm uppercase tracking-widest">Inventory empty. Add your first product.</p>
            </div>
          )}
        </div>
      </main>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl p-10 md:p-16 rounded-[60px] shadow-2xl relative">
            <h2 className="text-4xl font-black mb-10 italic uppercase tracking-tighter">Deploy New SKU</h2>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <input placeholder="Product Title" className="col-span-2 p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl font-bold outline-none" id="p-name" />
              <input type="number" placeholder="Price (PKR)" className="p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl font-bold outline-none" id="p-price" />
              <input type="number" placeholder="Stock Quantity" className="p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl font-bold outline-none" id="p-stock" />
              <input placeholder="Image URL (Unsplash or direct link)" className="col-span-2 p-5 bg-slate-50 border-2 border-transparent focus:border-[#febd69] rounded-2xl font-bold outline-none" id="p-img" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowProductModal(false)} className="flex-1 py-5 rounded-3xl font-black text-slate-400 hover:bg-slate-50 transition uppercase text-xs tracking-widest">Discard</button>
              <button onClick={async () => {
                const name = (document.getElementById('p-name') as HTMLInputElement).value;
                const price = Number((document.getElementById('p-price') as HTMLInputElement).value);
                const stock = Number((document.getElementById('p-stock') as HTMLInputElement).value);
                const img = (document.getElementById('p-img') as HTMLInputElement).value;
                if (!name || !shop) return;
                
                // Fix: Added missing currency property
                await api.saveProduct({
                  id: 'sku_' + Date.now(),
                  shopId: shop.id,
                  name, price, stock, 
                  currency: 'PKR',
                  imageUrl: img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                  description: 'Premium quality item from PK-MART.', category: shop.category,
                  images: [], sizes: ['M'], colors: ['Default'],
                  published: true, createdAt: new Date().toISOString()
                });
                
                const updated = await api.fetchProductsByShop(shop.id);
                setProducts(updated);
                setShowProductModal(false);
              }} className="flex-1 py-5 bg-[#febd69] rounded-3xl font-black text-lg shadow-xl shadow-amber-100 uppercase tracking-widest">Deploy to Store</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
