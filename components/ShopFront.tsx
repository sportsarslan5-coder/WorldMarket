
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
    const load = async () => {
      if (!slug) return;
      const found = await api.fetchShopBySlug(slug);
      if (found) {
        setShop(found);
        const p = await api.fetchSellerProducts(found.id);
        setProducts(p);
      }
      setIsLoading(false);
    };
    load();
  }, [slug]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct) return;
    setIsOrdering(true);

    const order: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      shopId: shop.id,
      shopName: shop.name,
      sellerWhatsApp: shop.whatsappNumber,
      customerName: custForm.name,
      customerPhone: custForm.phone,
      customerAddress: custForm.address,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        price: selectedProduct.price
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
    alert("Order Request Sent! Merchant will contact you on WhatsApp.");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
      <h1 className="text-3xl font-black italic mb-6 uppercase tracking-tighter">Shop Not Found</h1>
      <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Back to PK MART</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-green-100">
      <nav className="p-6 h-16 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="text-xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></Link>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">Official Merchant</span>
      </nav>

      <header className="bg-[#FBFBFD] py-32 px-6 text-center border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">{shop.name}</h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">{shop.description}</p>
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Verified Vendor
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group animate-fade-in flex flex-col">
              <div className="aspect-[4/5] bg-slate-50 rounded-3xl flex items-center justify-center p-10 overflow-hidden relative group-hover:shadow-2xl transition-all duration-500">
                <img src={p.imageUrl} className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
              </div>
              <div className="mt-8 space-y-2 flex-1">
                <h3 className="font-black text-lg uppercase tracking-tight">{p.name}</h3>
                <p className="text-2xl font-black text-slate-900 italic">Rs. {p.price.toLocaleString()}</p>
                <p className="text-xs text-slate-400 font-medium line-clamp-2 pb-6">{p.description}</p>
                <button onClick={() => setSelectedProduct(p)} className="mt-auto w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition shadow-xl active:scale-95">Order Now</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-end md:items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
           <div className="bg-white p-8 md:p-12 rounded-t-[40px] md:rounded-[40px] max-w-xl w-full relative shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition text-2xl">✕</button>
              
              <div className="flex gap-8 mb-10 items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-4">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight italic leading-tight mb-1">{selectedProduct.name}</h2>
                  <p className="text-green-600 font-black text-xl italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                 <input required placeholder="Full Name" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
                 <input required placeholder="Phone Number (e.g. 03...)" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
                 <textarea required placeholder="Delivery Address (Street, Area, City)" className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold resize-none" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                 
                 <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex justify-between items-center mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-green-800">Payment</p>
                    <span className="text-xs font-black uppercase tracking-widest text-green-900">Cash on Delivery</span>
                 </div>

                 <button disabled={isOrdering} className="w-full bg-slate-900 text-white h-16 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-green-600 transition disabled:opacity-50">
                   {isOrdering ? 'Deploying Order...' : 'Confirm Checkout'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
