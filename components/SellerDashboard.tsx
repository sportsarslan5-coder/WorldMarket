
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, SellerPayoutMethod, Shop } from '../types.ts';
import { api } from '../services/api.ts';

const SellerDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Seller | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isRegistering, setIsRegistering] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phone: '',
    shopName: '',
    payout: 'JazzCash' as SellerPayoutMethod,
    account: '',
  });

  const handleRegister = async () => {
    if (!regData.shopName || !regData.account) return;
    
    const id = 's-' + Math.random().toString(36).substr(2, 6);
    const slug = regData.shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newShop: Shop = {
      id: id,
      ownerId: id,
      name: regData.shopName,
      slug: slug,
      description: 'Official Multi-Vendor Node',
      logoUrl: '',
      status: 'active',
      verified: true
    };

    const newSeller: Seller = {
      id: id,
      fullName: regData.fullName,
      email: regData.email,
      phoneNumber: regData.phone,
      payoutMethod: regData.payout,
      accountNumber: regData.account,
      shopId: id,
      joinedAt: new Date().toISOString()
    };

    await api.saveShop(newShop);
    await api.saveSeller(newSeller);
    
    setCurrentUser(newSeller);
    setShop(newShop);
    setIsRegistering(false);
    
    // NOTIFY ADMIN
    // Fix: Use accountNumber instead of account from the Seller object
    const msg = `*🚀 NEW VENDOR:* ${newShop.name}\n*OWNER:* ${newSeller.fullName}\n*SLUG:* /shop/${newShop.slug}\n*PAYOUT:* ${newSeller.payoutMethod} (${newSeller.accountNumber})`;
    window.open(`https://wa.me/923079490721?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const saveProduct = async () => {
    if (!editingProduct?.name || !shop) return;
    const prod: Product = {
      id: editingProduct.id || 'p-' + Math.random().toString(36).substr(2, 6),
      shopId: shop.id,
      name: editingProduct.name,
      description: editingProduct.description || '',
      price: editingProduct.price || 0,
      category: editingProduct.category || 'General',
      imageUrl: editingProduct.imageUrl || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
      images: [],
      sizes: editingProduct.sizes || [],
      stock: editingProduct.stock || 0,
      published: true,
      createdAt: new Date().toISOString()
    };
    await api.saveProduct(prod);
    const updated = await api.fetchProductsByShop(shop.id);
    setProducts(updated);
    setEditingProduct(null);
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-[#131921] flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-xl p-12 rounded-[40px] shadow-2xl">
           <h2 className="text-4xl font-black mb-10 italic uppercase tracking-tighter">Global Activation</h2>
           <div className="space-y-4">
              <input placeholder="Shop Name" className="w-full p-5 bg-slate-50 rounded-2xl border" value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})} />
              <input placeholder="WhatsApp Phone" className="w-full p-5 bg-slate-50 rounded-2xl border" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
              <div className="p-8 bg-slate-900 rounded-3xl text-white">
                 <p className="text-[10px] font-black uppercase text-[#febd69] mb-4">Payout Method</p>
                 <select className="w-full bg-slate-800 p-4 rounded-xl mb-4" value={regData.payout} onChange={e => setRegData({...regData, payout: e.target.value as any})}>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                 </select>
                 <input placeholder="Account Number" className="w-full bg-slate-800 p-4 rounded-xl" value={regData.account} onChange={e => setRegData({...regData, account: e.target.value})} />
              </div>
              <button onClick={handleRegister} className="w-full bg-[#febd69] py-6 rounded-3xl font-black text-xl">Deploy Global Shop</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-72 bg-[#131921] text-white p-8">
        <h2 className="text-2xl font-black italic mb-10">PK-MART</h2>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('inventory')} className="w-full text-left font-black uppercase text-xs">Inventory</button>
          <button onClick={() => setActiveTab('orders')} className="w-full text-left font-black uppercase text-xs">Orders</button>
        </nav>
        <div className="mt-auto pt-10 border-t border-slate-800">
           <Link to={`/shop/${shop?.slug}`} target="_blank" className="text-blue-400 text-[10px] font-black uppercase">View Live Shop ↗</Link>
        </div>
      </div>
      <div className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-end mb-12">
           <h1 className="text-5xl font-black italic uppercase tracking-tighter">{shop?.name}</h1>
           <button onClick={() => setEditingProduct({ sizes: [], stock: 1 })} className="bg-[#febd69] px-8 py-4 rounded-2xl font-black">+ Add Listing</button>
        </header>

        <div className="grid grid-cols-3 gap-8">
           {products.map(p => (
             <div key={p.id} className="bg-white p-8 rounded-3xl border shadow-sm">
                <img src={p.imageUrl} className="w-full h-40 object-contain mb-6" alt="" />
                <h3 className="font-bold text-xl mb-4">{p.name}</h3>
                <p className="text-2xl font-black text-emerald-600">Rs. {p.price.toLocaleString()}</p>
             </div>
           ))}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl p-12 rounded-[50px] shadow-2xl">
              <h2 className="text-3xl font-black mb-10">New Global Listing</h2>
              <div className="space-y-4">
                 <input placeholder="Product Name" className="w-full p-5 bg-slate-50 border rounded-2xl" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                 <input type="number" placeholder="Price" className="w-full p-5 bg-slate-50 border rounded-2xl" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                 <textarea placeholder="Description" className="w-full p-5 bg-slate-50 border rounded-2xl h-32" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                 <div className="flex gap-4">
                    <button onClick={() => setEditingProduct(null)} className="flex-1 py-5 rounded-2xl bg-slate-100 font-black">Discard</button>
                    <button onClick={saveProduct} className="flex-1 py-5 rounded-2xl bg-[#febd69] font-black">Push to Cloud</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
