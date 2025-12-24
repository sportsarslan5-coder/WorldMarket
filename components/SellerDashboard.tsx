
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
  const [showProductModal, setShowProductModal] = useState(false);
  
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

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    img: '',
    sizes: 'M,L,XL',
    colors: 'Black,White'
  });

  useEffect(() => {
    const savedId = localStorage.getItem('ws_auth_shop_id');
    if (savedId) {
      api.fetchAllShops().then(all => {
        const found = all.find(s => s.id === savedId);
        if (found) {
          setShop(found);
          if (found.status === ShopStatus.ACTIVE) {
            setStep('active');
            api.fetchProductsByShop(found.id).then(setProducts);
          } else if (found.status === ShopStatus.PENDING_ADMIN_APPROVAL) {
            setStep('pending');
          } else {
            setStep('otp');
          }
        }
      });
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const created = await api.createShop(formData);
    setShop(created);
    localStorage.setItem('ws_auth_shop_id', created.id);
    if (onNotify) onNotify('NEW_SELLER', created);
    setStep('otp');
    setLoading(false);
  };

  const handleVerify = async () => {
    if (shop) {
      await api.updateShopStatus(shop.id, ShopStatus.PENDING_ADMIN_APPROVAL);
      setStep('pending');
    }
  };

  const deployProduct = async () => {
    if (!shop) return;
    const p: Product = {
      id: 'p_' + Date.now(),
      shopId: shop.id,
      name: newProduct.name,
      description: 'Premium quality crafted item.',
      price: Number(newProduct.price),
      currency: 'PKR',
      category: shop.category,
      imageUrl: newProduct.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      images: [],
      sizes: newProduct.sizes.split(',').map(s => s.trim()),
      colors: newProduct.colors.split(',').map(c => c.trim()),
      stock: Number(newProduct.stock),
      published: true,
      createdAt: new Date().toISOString()
    };
    await api.saveProduct(p);
    const updated = await api.fetchProductsByShop(shop.id);
    setProducts(updated);
    setShowProductModal(false);
  };

  if (step === 'register') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white max-w-2xl w-full p-12 rounded-[50px] shadow-2xl">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Vendor Registration</h2>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <input required placeholder="Shop Name" className="p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select className="p-5 bg-slate-50 rounded-2xl font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                 <option>Fashion</option><option>Electronics</option><option>Sports</option><option>Art</option>
              </select>
              <input required placeholder="Email" className="p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required placeholder="WhatsApp Number" className="p-5 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
            </div>
            <button className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-600 transition">Register Globally</button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'otp' || step === 'pending') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-white p-16 rounded-[60px] max-w-xl">
            <h2 className="text-4xl font-black mb-6 uppercase">{step === 'otp' ? 'Verification' : 'Awaiting Approval'}</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
               {step === 'otp' ? 'Your shop has been created. Click verify to enter the global node.' : 'Your shop is being reviewed by the Master Admin. Please wait for activation.'}
            </p>
            {step === 'otp' ? (
              <button onClick={handleVerify} className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black">Verify Node</button>
            ) : (
              <Link to="/" className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black inline-block">Back to Marketplace</Link>
            )}
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className="w-80 bg-slate-900 text-white p-10 flex flex-col">
         <div className="text-2xl font-black italic tracking-tighter mb-20 text-blue-400">VENDOR CONSOLE</div>
         <nav className="space-y-4 flex-1">
            <button className="w-full text-left p-5 bg-white/10 rounded-2xl font-black text-xs uppercase tracking-widest">Inventory</button>
            <button className="w-full text-left p-5 text-slate-500 font-black text-xs uppercase tracking-widest">Orders</button>
            <button className="w-full text-left p-5 text-slate-500 font-black text-xs uppercase tracking-widest">Settings</button>
         </nav>
         <Link to={`/shop/${shop?.slug}`} className="text-blue-400 font-bold text-xs truncate">View Store: /{shop?.slug}</Link>
      </aside>

      <main className="flex-1 p-16">
         <div className="flex justify-between items-end mb-16">
            <div>
               <h1 className="text-6xl font-black uppercase tracking-tighter">{shop?.name}</h1>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Active Node ID: {shop?.id}</p>
            </div>
            <button onClick={() => setShowProductModal(true)} className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">Add New SKU</button>
         </div>

         <div className="grid grid-cols-3 gap-10">
            {products.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                 <div className="h-56 bg-slate-50 rounded-[30px] p-8 mb-6 flex items-center justify-center">
                    <img src={p.imageUrl} className="max-h-full max-w-full object-contain" />
                 </div>
                 <h3 className="font-bold text-xl mb-2">{p.name}</h3>
                 <div className="flex justify-between items-baseline">
                    <p className="text-2xl font-black">Rs. {p.price.toLocaleString()}</p>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Qty: {p.stock}</span>
                 </div>
              </div>
            ))}
         </div>
      </main>

      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl p-16 rounded-[60px] relative">
              <h2 className="text-4xl font-black mb-10 uppercase tracking-tighter">Deploy SKU</h2>
              <div className="space-y-6">
                 <input placeholder="Product Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-6">
                    <input placeholder="Price (PKR)" className="p-5 bg-slate-50 rounded-2xl font-bold" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <input placeholder="Initial Stock" className="p-5 bg-slate-50 rounded-2xl font-bold" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                 </div>
                 <input placeholder="Image URL" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={newProduct.img} onChange={e => setNewProduct({...newProduct, img: e.target.value})} />
                 <div className="grid grid-cols-2 gap-6">
                    <input placeholder="Sizes (e.g. S,M,L)" className="p-5 bg-slate-50 rounded-2xl font-bold" value={newProduct.sizes} onChange={e => setNewProduct({...newProduct, sizes: e.target.value})} />
                    <input placeholder="Colors (e.g. Red,Blue)" className="p-5 bg-slate-50 rounded-2xl font-bold" value={newProduct.colors} onChange={e => setNewProduct({...newProduct, colors: e.target.value})} />
                 </div>
                 <div className="flex gap-4 mt-10">
                    <button onClick={() => setShowProductModal(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-400 uppercase text-xs">Cancel</button>
                    <button onClick={deployProduct} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl">Deploy to Node</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
