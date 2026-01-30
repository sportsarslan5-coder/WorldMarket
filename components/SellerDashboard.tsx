
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
    name: '', price: 0, size: '', color: '', description: '', imageUrl: '', category: 'General'
  });

  const loadData = async () => {
    if (sellerId) {
      const [s, p] = await Promise.all([api.getSellerById(sellerId), api.getProductsBySeller(sellerId)]);
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
    await api.uploadProduct({ ...form, sellerId, sellerName: seller.storeName });
    setShowModal(false);
    await loadData();
    setForm({ name: '', price: 0, size: '', color: '', description: '', imageUrl: '', category: 'General' });
  };

  if (loading && !seller) return <div className="h-screen flex items-center justify-center font-black animate-pulse">CONNECTING TO CLOUD...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{seller?.storeName} <span className="text-blue-600">HQ</span></h1>
            <Link to={`/${seller?.slug}`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition">View Live Storefront →</Link>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition">
            Add Product
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 group">
              <div className="aspect-square bg-slate-50 rounded-[32px] mb-6 overflow-hidden flex items-center justify-center p-6">
                <img src={p.imageUrl} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" alt="" />
              </div>
              <h3 className="font-bold text-xl mb-1 uppercase italic tracking-tighter">{p.name}</h3>
              <p className="text-2xl font-black text-slate-900">Rs. {p.price.toLocaleString()}</p>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-40 text-center border-4 border-dashed border-slate-200 rounded-[64px]">
               <p className="text-slate-300 font-black uppercase tracking-widest">Store Inventory Empty</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <form onSubmit={handleUpload} className="bg-white p-12 rounded-[48px] w-full max-w-xl shadow-2xl relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 font-black text-2xl">✕</button>
            <h3 className="text-3xl font-black mb-10 uppercase italic tracking-tighter">Inventory Upload</h3>
            <div className="space-y-4">
              <input required placeholder="Product Title" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                onChange={e => setForm({...form, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Price (PKR)" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                  onChange={e => setForm({...form, price: Number(e.target.value)})} />
                <input required placeholder="Size / Color" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                  onChange={e => setForm({...form, size: e.target.value, color: e.target.value})} />
              </div>
              <input required placeholder="Image URL" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold outline-none" 
                onChange={e => setForm({...form, imageUrl: e.target.value})} />
              <textarea required placeholder="Full Description" className="w-full h-28 p-6 bg-slate-50 rounded-2xl font-bold outline-none resize-none" 
                onChange={e => setForm({...form, description: e.target.value})} />
              <button className="w-full h-18 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition">
                Publish to Global Feed
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
