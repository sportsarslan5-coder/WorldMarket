
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const ShopFront: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  
  const [custForm, setCustForm] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    const loadShop = async () => {
      if (!slug) return;
      const found = await api.fetchShopBySlug(slug);
      if (found) {
        setShop(found);
        const p = await api.fetchSellerProducts(found.id);
        setProducts(p);
      }
      setIsLoading(false);
    };
    loadShop();
  }, [slug]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct) return;
    setIsOrdering(true);

    const order: Order = {
      id: 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      shopId: shop.id,
      shopName: shop.name,
      sellerWhatsApp: shop.whatsappNumber,
      customerName: custForm.name,
      customerPhone: custForm.phone,
      customerAddress: custForm.address,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImageUrl: selectedProduct.imageUrl,
        quantity: 1,
        price: selectedProduct.price,
        size: selectedProduct.size
      }],
      totalAmount: selectedProduct.price,
      paymentMethod: 'COD',
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await api.placeOrder(order);
    setSelectedProduct(null);
    setIsOrdering(false);
    setCustForm({ name: '', phone: '', address: '' });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 font-black text-[10px] uppercase tracking-widest text-slate-400">Loading Node...</p>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-4xl font-black mb-4">SHOP NOT FOUND</h1>
      <Link to="/" className="text-blue-600 font-bold underline">Return to Marketplace</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <header className="bg-slate-900 text-white py-20 px-6 text-center border-b-[8px] border-blue-600">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-4">{shop.name}</h1>
          <div className="flex justify-center items-center gap-4">
            <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Vendor</span>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Est. {new Date(shop.joinedAt).getFullYear()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-20">
        {products.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[50px]">
            <p className="text-slate-400 font-black uppercase tracking-widest">Store Inventory Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {products.map(p => (
              <div key={p.id} className="group bg-white rounded-[40px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition duration-500">
                <div className="aspect-square bg-slate-50 rounded-[30px] flex items-center justify-center p-8 mb-6 overflow-hidden relative">
                  <img src={p.imageUrl} className="h-full w-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                  {p.size && <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black uppercase text-slate-900">Size: {p.size}</div>}
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-1 truncate">{p.name}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">{p.category}</p>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-2xl font-black tracking-tighter">Rs. {p.price.toLocaleString()}</p>
                  <button 
                    onClick={() => setSelectedProduct(p)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-lg"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[500] flex items-center justify-center p-6" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white p-10 md:p-14 rounded-[50px] max-w-xl w-full animate-slide-up relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full font-black hover:bg-slate-100 transition">✕</button>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-slate-900">Secure Checkout</h2>
            <p className="text-slate-500 font-bold text-sm mb-8">Confirm your delivery details for: <span className="text-blue-600 font-black">{selectedProduct.name}</span></p>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
              <input required placeholder="Active Phone Number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
              <textarea required placeholder="Delivery Address (Full Details)" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-600 transition h-32 resize-none" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
              
              <div className="pt-6">
                <button disabled={isOrdering} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                  {isOrdering ? 'PROCESSING...' : 'CONFIRM ORDER VIA WHATSAPP'}
                </button>
                <p className="text-center text-[9px] font-black uppercase text-slate-400 mt-6 tracking-widest">Encrypted Direct Relay to Admin</p>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-100 py-20 px-6 text-center">
        <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.5em]">Powered by PK-MART Global Infrastructure</p>
      </footer>
    </div>
  );
};

export default ShopFront;
