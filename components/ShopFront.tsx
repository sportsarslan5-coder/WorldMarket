
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
    if (!shop || !imagePreview) {
      alert("Please select a product image first!");
      return;
    }

    const product: Product = {
      id: 'PRD-QUICK-' + Date.now(),
      sellerId: shop.id,
      sellerName: shop.name,
      name: newProd.name,
      description: "Quick Merchant SKU Deployment",
      price: Number(newProd.price),
      currency: "PKR",
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
    setNewProd({ name: '', price: '', cat: 'Fashion' });
  };

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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-slate-50">
      <h1 className="text-4xl font-black mb-4 tracking-tighter italic">SHOP NOT FOUND</h1>
      <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Return to Grid</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans pb-20">
      <nav className="p-8 max-w-[1400px] mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black italic tracking-tighter">PK<span className="text-blue-600">MART</span></Link>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant: {shop.id}</span>
      </nav>

      <header className="bg-slate-900 text-white py-24 px-6 text-center border-b-[12px] border-blue-600 mb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-6">{shop.name}</h1>
          <p className="text-slate-400 font-bold max-w-xl mx-auto uppercase text-xs tracking-[0.2em] mb-10">{shop.description}</p>
          <div className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Verified Global Node</div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6">
        {products.length === 0 ? (
          <div className="text-center py-40 border-4 border-dashed border-slate-200 rounded-[60px] bg-white">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Node Inventory Empty</p>
            <p className="text-slate-300 text-[10px] mt-2 font-bold">Use the floating button to deploy SKUs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {products.map(p => (
              <div key={p.id} className="group bg-white rounded-[50px] p-6 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="aspect-square bg-slate-50 rounded-[40px] flex items-center justify-center p-8 mb-8 overflow-hidden relative">
                  <img src={p.imageUrl} className="h-full w-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition duration-500"></div>
                </div>
                <h3 className="font-black text-2xl text-slate-900 mb-2 truncate px-2">{p.name}</h3>
                <div className="flex items-center justify-between mt-8 px-2">
                  <p className="text-3xl font-black tracking-tighter text-slate-900">Rs. {p.price.toLocaleString()}</p>
                  <button onClick={() => setSelectedProduct(p)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Merchant Action */}
      <div className="fixed bottom-12 right-12 z-[100]">
        <button 
          onClick={() => setShowMerchantAdd(true)}
          className="bg-slate-900 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 group border-8 border-white"
        >
          <svg className="w-10 h-10 group-hover:rotate-90 transition duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>

      {/* Quick Add Modal */}
      {showMerchantAdd && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[500] flex items-center justify-center p-6" onClick={() => setShowMerchantAdd(false)}>
           <div className="bg-white p-12 rounded-[60px] max-w-xl w-full relative animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-4xl font-black mb-10 uppercase italic tracking-tighter">Deploy SKU to Grid</h2>
              <form onSubmit={handleMerchantUpload} className="space-y-6">
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-56 border-4 border-dashed border-slate-100 rounded-[40px] flex items-center justify-center cursor-pointer hover:border-blue-500 transition relative overflow-hidden bg-slate-50 group"
                 >
                    {imagePreview ? (
                      <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover group-hover:opacity-70 transition" />
                    ) : (
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Select from Gallery</p>
                        <p className="text-slate-300 text-[8px] font-bold">DEVICE_SYSTEM_ACCESS_OK</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>
                 <input required placeholder="Item Name" className="w-full p-6 bg-slate-50 rounded-3xl outline-none font-black text-lg border-2 border-transparent focus:border-blue-600" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
                 <input required placeholder="Price (PKR)" type="number" className="w-full p-6 bg-slate-50 rounded-3xl outline-none font-black text-lg border-2 border-transparent focus:border-blue-600" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} />
                 <button className="w-full bg-slate-900 text-white py-8 rounded-[30px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all text-xl">Confirm Deployment</button>
              </form>
           </div>
        </div>
      )}

      {/* Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[500] flex items-center justify-center p-6" onClick={() => setSelectedProduct(null)}>
           <div className="bg-white p-12 md:p-16 rounded-[60px] max-w-2xl w-full relative animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full font-black">✕</button>
              
              <div className="flex gap-10 mb-12 items-center">
                <div className="w-32 h-32 bg-slate-50 rounded-[30px] flex items-center justify-center p-6 shrink-0">
                  <img src={selectedProduct.imageUrl} className="max-h-full" alt="" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{selectedProduct.name}</h2>
                  <p className="text-blue-600 font-black text-xl tracking-tighter">Rs. {selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input required placeholder="Full Name" className="w-full p-6 bg-slate-50 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-blue-600" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
                   <input required placeholder="Phone (Active)" className="w-full p-6 bg-slate-50 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-blue-600" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
                 </div>
                 <textarea required placeholder="Delivery Address (Full Details)" className="w-full p-6 bg-slate-50 rounded-3xl outline-none font-bold h-32 border-2 border-transparent focus:border-blue-600" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                 
                 <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Payment Method</p>
                    <p className="text-sm font-black text-slate-900">Cash on Delivery (Standard)</p>
                 </div>

                 <button disabled={isOrdering} className="w-full bg-slate-900 text-white py-8 rounded-[30px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all text-xl">
                   {isOrdering ? 'PROCESSING NODE...' : 'Place Order via WhatsApp'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
