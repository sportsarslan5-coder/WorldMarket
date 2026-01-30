
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Seller } from '../types.ts';

const SellerDashboard: React.FC = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    name: '',
    price: 0,
    size: 'All Sizes',
    description: '',
    imageUrl: '',
    category: 'Electronics'
  });

  const loadData = async () => {
    if (sellerId) {
      const [s, p] = await Promise.all([
        api.getSellerById(sellerId),
        api.getProductsBySeller(sellerId)
      ]);
      setSeller(s);
      setProducts(p);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [sellerId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId || !seller) return;
    setLoading(true);
    await api.uploadProduct({ 
      ...form, 
      sellerId, 
      sellerName: seller.storeName 
    });
    setShowModal(false);
    await loadData();
    setForm({ name: '', price: 0, size: 'All Sizes', description: '', imageUrl: '', category: 'Electronics' });
  };

  if (loading && !seller) return <div className="h-screen flex items-center justify-center font-black animate-pulse">AUTHORIZING SESSION...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">{seller?.storeName} <span className="text-blue-600">Console</span></h2>
            <div className="mt-4 flex gap-4">
               <Link to={`/${seller?.slug}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition">View Live Store →</Link>
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Status: Active</span>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition active:scale-95">
            Deploy Product
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
             <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-200 rounded-[64px]">
                <p className="text-slate-300 font-black uppercase text-sm tracking-widest">Inventory empty. Ready for deployment.</p>
             </div>
          ) : products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-2xl transition-all">
              <div className="aspect-square bg-slate-50 rounded-[32px] mb-6 overflow-hidden flex items-center justify-center p-6">
                <img src={p.imageUrl} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" alt="" />
              </div>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{p.category}</p>
              <h3 className="font-bold text-xl mb-1 truncate uppercase italic tracking-tighter">{p.name}</h3>
              <p className="text-2xl font-black text-slate-900">Rs. {p.price.toLocaleString()}</p>
              <div className="mt-6 flex gap-2">
                 <button className="flex-1 h-12 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition">Analytics</button>
                 <button className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <form onSubmit={handleUpload} className="bg-white p-12 rounded-[48px] w-full max-w-xl shadow-2xl relative animate-scale-in">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 font-black text-2xl hover:rotate-90 transition-transform">✕</button>
            <h3 className="text-3xl font-black mb-10 uppercase italic tracking-tighter">Inventory Upload</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Product Title</label>
                <input required className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                  onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Price (PKR)</label>
                  <input required type="number" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                    onChange={e => setForm({...form, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Variants / Size</label>
                  <input required placeholder="e.g. S, M, L" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                    onChange={e => setForm({...form, size: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Product Image Link</label>
                <input required placeholder="https://..." className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                  onChange={e => setForm({...form, imageUrl: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                <select className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none appearance-none" 
                  onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Electronics</option>
                  <option>Apparel</option>
                  <option>Footwear</option>
                  <option>Sports Gear</option>
                  <option>Home Decor</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
                <textarea className="w-full h-28 p-6 bg-slate-50 rounded-2xl font-bold outline-none resize-none" 
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <button className="w-full h-18 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 active:scale-95 transition mt-6">
                Publish to Live Store
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
