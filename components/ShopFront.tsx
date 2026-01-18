
import React, { useState, useEffect, useRef } from 'react';
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
  
  const [showMerchantAdd, setShowMerchantAdd] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProd, setNewProd] = useState({ name: '', price: '', cat: 'Fashion' });

  const [custForm, setCustForm] = useState({ name: '', phone: '', address: '' });

  const loadShopData = async () => {
    if (!slug) return;
    const found = await api.fetchShopBySlug(slug);
    if (found) {
      setShop(found);
      const p = await api.fetchSellerProducts(found.id);
      setProducts(p);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadShopData();
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMerchantUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !imagePreview) return;

    const product: Product = {
      id: 'PRD-QUICK-' + Date.now(),
      sellerId: shop.id,
      sellerName: shop.name,
      name: newProd.name,
      description: "Premium SKU Deployment",
      price: Number(newProd.price),
      currency: "USD",
      category: newProd.cat,
      imageUrl: imagePreview,
      stock: 100,
      published: true,
      createdAt: new Date().toISOString()
    };

    await api.uploadProduct(product);
    await loadShopData();
    setShowMerchantAdd(false);
    setImagePreview(null);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct) return;
    setIsOrdering(true);

    const order: Order = {
      id: 'USA-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
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
      currency: 'USD',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await api.placeOrder(order);
    setSelectedProduct(null);
    setIsOrdering(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Brand node not found.</h1>
      <Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm">Return Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <nav className="p-6 h-16 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="text-xl font-extrabold tracking-tight">USA<span className="text-blue-600">SHOP</span></Link>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{shop.id} // Verified Merchant</span>
      </nav>

      <header className="bg-[#FBFBFD] py-24 px-6 text-center border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">{shop.name}</h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">{shop.description}</p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Global Partner Node
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-20">
        {products.length === 0 ? (
          <div className="text-center py-40 border border-slate-200 border-dashed rounded-2xl bg-slate-50/50">
            <p className="text-slate-400 font-bold text-sm">Inventory currently being synced.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map(p => (
              <div key={p.id} className="group animate-fade-in">
                <div className="aspect-[4/5] bg-[#F5F5F7] rounded-2xl flex items-center justify-center p-12 overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                  <img src={p.imageUrl} className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" alt={p.name} />
                </div>
                <div className="mt-6 space-y-2">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-extrabold text-slate-900">${p.price.toLocaleString()}</p>
                    <button onClick={() => setSelectedProduct(p)} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-xs hover:bg-blue-600 transition transform active:scale-95">Shop Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action for Seller UI */}
      <button 
        onClick={() => setShowMerchantAdd(true)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-900 transition-all z-40 transform active:scale-90"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
      </button>

      {/* Modern Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedProduct(null)}>
           <div className="bg-white p-8 md:p-12 rounded-3xl max-w-xl w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button>
              
              <div className="flex gap-8 mb-10 items-center border-b border-slate-50 pb-8">
                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center p-4 shrink-0">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-1">{selectedProduct.name}</h2>
                  <p className="text-blue-600 font-bold text-xl">${selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input required placeholder="Full Name" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
                   <input required placeholder="Phone" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
                 </div>
                 <textarea required placeholder="Delivery Address" className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600/20 font-medium resize-none" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                 
                 <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/30 flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Checkout Total</p>
                      <p className="text-sm font-bold text-slate-900">${selectedProduct.price.toLocaleString()} USD</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Payment on Delivery</span>
                 </div>

                 <button disabled={isOrdering} className="w-full bg-slate-900 text-white h-14 rounded-full font-bold text-sm shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50">
                   {isOrdering ? 'Confirming...' : 'Place Secure Order'}
                 </button>
                 <p className="text-center text-[10px] text-slate-400 font-medium">Your order will be shared with the merchant for fulfillment.</p>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
