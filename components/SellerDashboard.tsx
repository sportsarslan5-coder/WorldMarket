
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Seller } from '../types.ts';

const SellerDashboard: React.FC = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    name: '', price: 0, size: '', color: '', description: '', imageUrl: '', category: 'Apparel'
  });

  const loadData = async () => {
    if (sellerId) {
      const [s, p] = await Promise.all([api.getSellerById(sellerId), api.getProductsBySeller(sellerId)]);
      setSeller(s);
      setProducts(p.reverse());
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [sellerId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId || !seller) return;
    setLoading(true);
    await api.uploadProduct({ ...form, sellerId, sellerName: seller.storeName });
    setShowModal(false);
    await loadData();
    setForm({ name: '', price: 0, size: '', color: '', description: '', imageUrl: '', category: 'Apparel' });
  };

  if (loading && !seller) return (
    <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest">Establishing Secure Session...</div>
  );

  return (
    <div className="min-h-screen bg-white font-sans p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8 border-b border-slate-100 pb-12">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">{seller?.storeName} <span className="text-blue-600">Merchant HQ</span></h1>
            <div className="flex gap-6 items-center">
               <Link to={`/${seller?.slug}`} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">View Live Public Storefront →</Link>
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-100 px-3 py-1 rounded-full">Status: Cloud Verified</span>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="w-full md:w-auto bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition active:scale-95">
            Add New Product
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-slate-50 rounded-[48px] mb-8 overflow-hidden relative border border-slate-50 p-10">
                <img src={p.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400'} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" alt="" />
                <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-2xl text-[10px] font-black shadow-lg">Rs. {p.price.toLocaleString()}</div>
              </div>
              <h3 className="font-black text-xl mb-1 uppercase italic tracking-tighter leading-none">{p.name}</h3>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">{p.category} • {p.size}</p>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-100 rounded-[64px]">
               <p className="text-slate-300 font-black uppercase text-xs tracking-[0.4em]">Node Storage Empty. Deploy your first product.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <form onSubmit={handleUpload} className="bg-white p-12 rounded-[56px] w-full max-w-2xl shadow-2xl relative animate-scale-in my-auto">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 font-black text-3xl hover:rotate-90 transition-transform">✕</button>
            <h3 className="text-4xl font-black mb-12 uppercase italic tracking-tighter leading-none">Inventory Deployment</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Product Title</label>
                  <input required className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20" 
                    onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Price (PKR)</label>
                  <input required type="number" className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20" 
                    onChange={e => setForm({...form, price: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Product Category</label>
                  <select className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none appearance-none"
                    onChange={e => setForm({...form, category: e.target.value})}>
                    <option>Apparel</option>
                    <option>Electronics</option>
                    <option>Footwear</option>
                    <option>Health & Beauty</option>
                    <option>Home Decor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Variants (Size/Color)</label>
                  <input required placeholder="S, M, L / Black, Red" className="w-full h-16 px-6 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-600/20" 
                    onChange={e => setForm({...form, size: e.target.value, color: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Product Image</label>
                <div className="relative group">
                   <input type="file" accept="image/*" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                   <div className="w-full h-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:bg-slate-100 transition">
                      {form.imageUrl ? 'Image Selected (Click to change)' : 'Select Image from Gallery'}
                   </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Description</label>
                <textarea required className="w-full h-32 p-6 bg-slate-50 rounded-2xl font-bold border-none outline-none resize-none" 
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <button disabled={loading} className="w-full h-20 bg-blue-600 text-white rounded-[28px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/30 active:scale-95 transition mt-8 disabled:opacity-50">
                {loading ? 'SYNCHRONIZING CLOUD...' : 'Confirm Global Deployment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
