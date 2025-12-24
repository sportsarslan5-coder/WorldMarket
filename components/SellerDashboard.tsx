
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shop, Product } from '../types.ts';
import { Link } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [regData, setRegData] = useState({ name: '', email: '', whatsapp: '', category: 'Fashion' });
  const [skuData, setSkuData] = useState({ name: '', price: '', stock: '10', img: '', sizes: 'S,M,L', colors: 'Multi' });

  useEffect(() => {
    const authId = localStorage.getItem('PK_MART_SELLER_ID');
    if (authId) {
      api.fetchAllShops().then(all => {
        const found = all.find(s => s.id === authId);
        if (found) {
          setShop(found);
          setIsLoggedIn(true);
          api.fetchProductsBySeller(found.id).then(setProducts);
        }
      });
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    const created = await api.createShop(regData);
    setShop(created);
    localStorage.setItem('PK_MART_SELLER_ID', created.id);
    setIsLoggedIn(true);
    setIsSyncing(false);
  };

  const handleUpload = async () => {
    if (!shop) return;
    setIsSyncing(true);
    const newProduct: Product = {
      id: 'PROD-' + Date.now(),
      sellerId: shop.id,
      sellerName: shop.name,
      name: skuData.name,
      description: 'Official Vendor SKU',
      price: Number(skuData.price),
      currency: 'PKR',
      category: shop.category,
      imageUrl: skuData.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      images: [],
      sizes: skuData.sizes.split(','),
      colors: skuData.colors.split(','),
      stock: Number(skuData.stock),
      published: true,
      createdAt: new Date().toISOString()
    };
    await api.saveProduct(newProduct);
    const refreshed = await api.fetchProductsBySeller(shop.id);
    setProducts(refreshed);
    setShowModal(false);
    setIsSyncing(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white p-12 md:p-16 rounded-[60px] max-w-xl w-full animate-slide-up shadow-2xl">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">Vendor Hub</h2>
          <p className="text-slate-400 font-bold mb-10 text-xs uppercase tracking-widest">Immediate Global Access</p>
          <form onSubmit={handleRegister} className="space-y-4">
            <input required placeholder="Shop Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
            <input required placeholder="Email" type="email" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
            <input required placeholder="WhatsApp Number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={regData.whatsapp} onChange={e => setRegData({...regData, whatsapp: e.target.value})} />
            <button disabled={isSyncing} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-blue-600 transition disabled:opacity-50">
              {isSyncing ? 'CREATING NODE...' : 'START SELLING NOW'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 bg-slate-900 p-10 text-white flex flex-col h-screen sticky top-0">
        <div className="text-2xl font-black italic tracking-tighter mb-20">PK_VENDOR</div>
        <div className="space-y-4 flex-1">
          <button className="w-full text-left p-5 bg-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest">Inventory</button>
          <Link to="/" className="block p-5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition">Marketplace</Link>
          <Link to={`/shop/${shop?.slug}`} className="block p-5 text-emerald-400 font-black text-[10px] uppercase tracking-widest border border-emerald-400/20 rounded-2xl hover:bg-emerald-400 hover:text-white transition">View Live Shop</Link>
        </div>
        <button onClick={() => { localStorage.removeItem('PK_MART_SELLER_ID'); window.location.reload(); }} className="text-slate-600 font-black text-[10px] uppercase">Logout</button>
      </aside>

      <main className="flex-1 p-8 lg:p-16">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900">{shop?.name}</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Global Vendor ID: {shop?.id}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">Add Product</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col shadow-sm">
              <div className="h-48 bg-slate-50 rounded-3xl mb-6 flex items-center justify-center p-6">
                <img src={p.imageUrl} className="max-h-full object-contain" alt="p" />
              </div>
              <h3 className="font-black text-xl text-slate-900 mb-2">{p.name}</h3>
              <p className="text-2xl font-black text-slate-900 mb-6">Rs. {p.price.toLocaleString()}</p>
              <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Stock: {p.stock}</span>
                <span className="text-[10px] font-black text-blue-600 uppercase">Live</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl p-12 rounded-[50px] animate-slide-up relative">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 font-black">✕</button>
            <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter">New SKU Upload</h2>
            <div className="space-y-4">
              <input placeholder="Product Title" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={skuData.name} onChange={e => setSkuData({...skuData, name: e.target.value})} />
              <input placeholder="Price (PKR)" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={skuData.price} onChange={e => setSkuData({...skuData, price: e.target.value})} />
              <input placeholder="Image URL" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={skuData.img} onChange={e => setSkuData({...skuData, img: e.target.value})} />
              <button onClick={handleUpload} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl">PUSH TO GLOBAL GRID</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
