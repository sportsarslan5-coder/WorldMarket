
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, SellerPayoutMethod } from '../types.ts';

interface SellerDashboardProps {
  currentUser: Seller | null;
  setCurrentUser: (seller: Seller | null) => void;
  sellers: Seller[];
  products: Product[];
  orders: Order[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSellers: (sellers: Seller[]) => void;
}

const ADMIN_WHATSAPP = "923079490721";

const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
  currentUser, setCurrentUser, sellers = [], products = [], orders = [], onUpdateProducts, onUpdateSellers 
}) => {
  const [isRegistering, setIsRegistering] = useState(!currentUser);
  const [regSuccess, setRegSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    shopName: '',
    payoutMethod: 'JazzCash' as SellerPayoutMethod,
    accountNumber: '',
  });

  const sellerProducts = products?.filter(p => p.sellerId === currentUser?.id) || [];
  const sellerOrders = orders?.filter(o => o.sellerId === currentUser?.id) || [];

  const handleRegister = () => {
    if(!regData.fullName || !regData.shopName || !regData.accountNumber || !regData.email) {
      alert("Registration Error: All fields are required to verify your Pakistani identity.");
      return;
    }
    
    const shopSlug = regData.shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newSeller: Seller = {
      id: 's' + Math.random().toString(36).substr(2, 9),
      fullName: regData.fullName,
      email: regData.email,
      phoneNumber: regData.phoneNumber,
      payoutMethod: regData.payoutMethod,
      accountNumber: regData.accountNumber,
      shopName: regData.shopName,
      shopSlug: shopSlug,
      joinedAt: new Date().toISOString()
    };

    // Deep link for Admin to open the website
    const shopLink = `${window.location.origin}/#/shop/${shopSlug}`;
    
    // Hidden Admin Notification formatting
    const message = `*VEO-PK ADMIN: NEW SELLER*%0A` +
                    `--------------------------%0A` +
                    `*Name:* ${newSeller.fullName}%0A` +
                    `*Email:* ${newSeller.email}%0A` +
                    `*Shop:* ${newSeller.shopName}%0A` +
                    `*Payout:* ${newSeller.payoutMethod} - ${newSeller.accountNumber}%0A` +
                    `*WhatsApp:* ${newSeller.phoneNumber}%0A%0A` +
                    `*Open Website:* ${shopLink}`;

    onUpdateSellers([...sellers, newSeller]);
    setCurrentUser(newSeller);
    setRegSuccess(true);
    setIsRegistering(false);

    // Redirect to WhatsApp to notify Admin
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.name || !editingProduct?.price || !currentUser) return;

    if (editingProduct.id) {
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? (editingProduct as Product) : p));
    } else {
      const newProd: Product = {
        ...(editingProduct as Omit<Product, 'id' | 'sellerId' | 'createdAt'>),
        id: 'p' + Math.random().toString(36).substr(2, 9),
        sellerId: currentUser.id,
        category: editingProduct.category || 'General',
        rating: 5.0,
        reviewsCount: 0,
        published: true,
        createdAt: new Date().toISOString(),
      } as Product;
      onUpdateProducts([...products, newProd]);
    }
    setEditingProduct(null);
  };

  if (regSuccess && currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-white p-12 rounded-2xl shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">✓</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Registration Logged!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Your details for <b>{currentUser.shopName}</b> have been submitted. The Admin is reviewing your JazzCash/Bank details for payout verification.
          </p>
          <div className="flex flex-col gap-4">
            <Link to={`/shop/${currentUser.shopSlug}`} className="bg-[#131921] text-white py-4 rounded-lg font-black text-lg">Visit My Website Link</Link>
            <button onClick={() => setRegSuccess(false)} className="bg-[#febd69] text-[#131921] py-4 rounded-lg font-black text-lg">Open Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] py-20 px-4 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full p-10 bg-white rounded-xl shadow-xl">
          <h1 className="text-3xl font-black text-slate-900 mb-8 text-center">Open Your Shop</h1>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Legal Name</label>
              <input 
                type="text" className="w-full rounded-lg border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Gmail Account</label>
              <input 
                type="email" className="w-full rounded-lg border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Shop Name</label>
              <input 
                type="text" className="w-full rounded-lg border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 border" 
                value={regData.shopName} onChange={e => setRegData({...regData, shopName: e.target.value})}
              />
            </div>
            <div className="p-6 bg-slate-900 rounded-lg text-white">
              <h3 className="text-xs font-black uppercase text-[#febd69] mb-4">Payout Account Details</h3>
              <div className="flex flex-col gap-4">
                <select 
                  className="w-full bg-slate-800 rounded-lg p-3 font-bold border border-slate-700"
                  value={regData.payoutMethod} onChange={e => setRegData({...regData, payoutMethod: e.target.value as SellerPayoutMethod})}
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <input 
                  type="text" placeholder="Account No / IBAN" className="w-full bg-slate-800 rounded-lg p-3 font-mono outline-none border border-slate-700" 
                  value={regData.accountNumber} onChange={e => setRegData({...regData, accountNumber: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={handleRegister}
              className="w-full py-5 rounded-lg bg-[#25D366] text-white font-black text-xl shadow-lg hover:bg-[#128C7E] transition"
            >
              Verify & Launch Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f3f3f3] font-sans">
      <div className="w-full lg:w-64 bg-[#131921] text-white p-6 flex flex-col shadow-xl">
        <Link to="/" className="text-xl font-black mb-10 block">PK<span className="text-[#febd69]">-</span>MART</Link>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('products')} className={`w-full text-left p-4 rounded-lg font-bold ${activeTab === 'products' ? 'bg-slate-800 text-[#febd69]' : 'text-slate-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-4 rounded-lg font-bold ${activeTab === 'orders' ? 'bg-slate-800 text-[#febd69]' : 'text-slate-400'}`}>Orders</button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-4 rounded-lg font-bold ${activeTab === 'profile' ? 'bg-slate-800 text-[#febd69]' : 'text-slate-400'}`}>Profile</button>
        </nav>
        <button onClick={() => setCurrentUser(null)} className="mt-auto py-3 bg-red-900/20 text-red-400 rounded-lg font-black text-xs">Logout</button>
      </div>

      <div className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-center mb-10">
           <h1 className="text-3xl font-black text-slate-900">{currentUser?.shopName}</h1>
           {activeTab === 'products' && (
             <button onClick={() => setEditingProduct({})} className="bg-[#febd69] px-6 py-3 rounded-lg font-black text-sm">+ New Item</button>
           )}
        </header>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sellerProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold border-2 border-dashed rounded-xl">No items listed. Start selling!</div>
            ) : (
              sellerProducts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="h-48 bg-slate-50 mb-4 flex items-center justify-center rounded-lg">
                    <img src={p.imageUrl} className="max-h-full object-contain" alt={p.name} />
                  </div>
                  <h3 className="font-bold text-slate-800">{p.name}</h3>
                  <div className="text-emerald-600 font-black mt-2">Rs. {p.price.toLocaleString()}</div>
                  <button onClick={() => setEditingProduct(p)} className="w-full mt-4 py-2 border rounded-lg text-xs font-black">Edit</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr><th className="p-6 text-[10px] font-black uppercase text-slate-400">Order ID</th><th className="p-6 text-[10px] font-black uppercase text-slate-400">Customer</th><th className="p-6 text-right text-[10px] font-black uppercase text-slate-400">Net Share</th></tr>
              </thead>
              <tbody className="divide-y">
                {sellerOrders.map(o => (
                  <tr key={o.id}>
                    <td className="p-6 font-black">#{o.id}</td>
                    <td className="p-6">
                      <p className="font-bold text-slate-800 text-sm">{o.customerName}</p>
                      <p className="text-[10px] text-slate-400">{o.customerPhone}</p>
                    </td>
                    <td className="p-6 text-right font-black text-emerald-600">Rs. {o.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-2xl p-10 animate-in zoom-in">
              <h2 className="text-2xl font-black mb-8">Edit Product</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Product Name" className="w-full p-4 rounded-lg border font-bold" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                <input type="number" placeholder="Price (Rs.)" className="w-full p-4 rounded-lg border font-bold" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                <textarea placeholder="Description" className="w-full p-4 rounded-lg border font-bold h-24" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                <input type="text" placeholder="Image URL" className="w-full p-4 rounded-lg border font-bold" value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} />
              </div>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setEditingProduct(null)} className="flex-1 py-4 bg-slate-100 rounded-lg font-black">Cancel</button>
                <button onClick={handleSaveProduct} className="flex-1 py-4 bg-[#febd69] rounded-lg font-black">Save Item</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
