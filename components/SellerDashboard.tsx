
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product } from '../types.ts';

const SellerDashboard: React.FC = () => {
  const { sellerId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: 0,
    size: 'M',
    description: '',
    imageUrl: '',
    category: 'General'
  });

  const loadProducts = async () => {
    if (sellerId) {
      const data = await api.getProductsBySeller(sellerId);
      setProducts(data);
    }
  };

  useEffect(() => { loadProducts(); }, [sellerId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    await api.uploadProduct({ ...form, sellerId, sellerName: "Seller" });
    setShowModal(false);
    loadProducts();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Vendor <span className="text-blue-600">Console</span></h2>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition">
          Add Product
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <img src={p.imageUrl} className="w-full h-48 object-cover rounded-2xl mb-4" />
            <h3 className="font-bold text-lg mb-1">{p.name}</h3>
            <p className="text-blue-600 font-black text-xl">${p.price}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <form onSubmit={handleUpload} className="bg-white p-10 rounded-[40px] w-full max-w-lg shadow-2xl relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-6 right-6 font-black text-xl">✕</button>
            <h3 className="text-2xl font-black mb-8 uppercase italic">Deploy New Item</h3>
            <div className="space-y-4">
              <input required placeholder="Product Name" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold" 
                onChange={e => setForm({...form, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Price" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold" 
                  onChange={e => setForm({...form, price: Number(e.target.value)})} />
                <input required placeholder="Size/Variant" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold" 
                  onChange={e => setForm({...form, size: e.target.value})} />
              </div>
              <input required placeholder="Image URL (Direct Link)" className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold" 
                onChange={e => setForm({...form, imageUrl: e.target.value})} />
              <textarea placeholder="Description" className="w-full h-32 p-6 bg-slate-50 rounded-2xl font-bold" 
                onChange={e => setForm({...form, description: e.target.value})} />
              <button className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest">Publish to Store</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
