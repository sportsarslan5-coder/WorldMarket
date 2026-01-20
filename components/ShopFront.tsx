
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [custForm, setCustForm] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    paymentMethod: 'JazzCash' as 'JazzCash' | 'EasyPaisa',
    transactionId: '',
    screenshot: ''
  });

  const MERCHANT_NUMBER = "03079490721";

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

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustForm(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAppRedirect = () => {
    if (!selectedProduct) return;
    const amount = selectedProduct.price;
    const message = `Assalam-o-Alaikum, I want to pay Rs. ${amount.toLocaleString()} for ${selectedProduct.name} via ${custForm.paymentMethod}.`;
    const waUrl = `https://wa.me/${MERCHANT_NUMBER.replace(/^0/, '92')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct) return;
    
    setIsOrdering(true);
    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const order: Order = {
      id: orderId,
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
      paymentMethod: custForm.paymentMethod,
      transactionId: custForm.transactionId,
      paymentScreenshot: custForm.screenshot,
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await api.placeOrder(order);
    
    alert("ORDER SUBMITTED! Status: PENDING. Verification in progress.");
    setSelectedProduct(null);
    setIsOrdering(false);
    setCustForm({ name: '', phone: '', address: '', paymentMethod: 'JazzCash', transactionId: '', screenshot: '' });
  };

  const isFormValid = custForm.name && custForm.phone && custForm.address && (custForm.transactionId || custForm.screenshot);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100">
      <nav className="p-6 h-16 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="text-xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></Link>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">Official Marketplace</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
           <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">{shop?.name}</h1>
           <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Verified PK MART Vendor</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map(p => (
            <div key={p.id} className="group animate-fade-in flex flex-col bg-slate-50 rounded-[40px] p-8 hover:bg-white border border-transparent hover:border-slate-100 transition-all duration-500 hover:shadow-2xl">
              <div className="aspect-square flex items-center justify-center mb-6">
                <img src={p.imageUrl} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700" alt="" />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg uppercase tracking-tight">{p.name}</h3>
                    <span className="bg-green-100 text-green-700 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{p.views}M Views</span>
                 </div>
                 <p className="text-2xl font-black text-slate-900 italic">Rs. {p.price.toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedProduct(p)} className="mt-6 w-full h-12 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition shadow-lg active:scale-95">Checkout Now</button>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedProduct(null)}>
           <div className="bg-white p-8 md:p-12 rounded-[40px] max-w-2xl w-full relative shadow-2xl animate-fade-in my-10" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition text-2xl">✕</button>
              
              <div className="flex gap-6 mb-10 items-center border-b border-slate-50 pb-8">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-2">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight italic">{selectedProduct.name}</h2>
                  <p className="text-green-600 font-black text-2xl italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                      <input required placeholder="Full Name" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-green-600/20" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                      <input required placeholder="03XXXXXXXXX" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-green-600/20" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Complete Address</label>
                    <textarea required placeholder="House #, Street, Area, City" className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold resize-none focus:ring-2 focus:ring-green-600/20" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Payment Gateway</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button type="button" onClick={() => setCustForm({...custForm, paymentMethod: 'JazzCash'})} className={`h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition ${custForm.paymentMethod === 'JazzCash' ? 'bg-red-50 border-red-600 text-red-600' : 'bg-white border-slate-100 text-slate-400'}`}>JazzCash</button>
                       <button type="button" onClick={() => setCustForm({...custForm, paymentMethod: 'EasyPaisa'})} className={`h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition ${custForm.paymentMethod === 'EasyPaisa' ? 'bg-green-50 border-green-600 text-green-600' : 'bg-white border-slate-100 text-slate-400'}`}>EasyPaisa</button>
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white p-8 rounded-[32px] space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-6">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Send Payment To</p>
                          <p className="text-2xl font-black italic">{MERCHANT_NUMBER}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Amount Due</p>
                          <p className="text-2xl font-black text-green-400">Rs. {selectedProduct.price.toLocaleString()}</p>
                       </div>
                    </div>

                    <button type="button" onClick={handleAppRedirect} className="w-full h-12 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition">
                      Launch {custForm.paymentMethod} App
                    </button>

                    <div className="space-y-4 pt-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Verification Details Required</p>
                       <input 
                         placeholder="12-Digit Transaction ID" 
                         className="w-full h-12 px-5 bg-white/5 border border-white/10 rounded-xl outline-none font-bold text-white text-center focus:border-green-500 transition" 
                         value={custForm.transactionId}
                         onChange={e => setCustForm({...custForm, transactionId: e.target.value})}
                       />
                       <div className="flex items-center gap-4">
                          <div className="flex-1 h-[1px] bg-white/10"></div>
                          <span className="text-[9px] font-black text-white/30 uppercase">OR</span>
                          <div className="flex-1 h-[1px] bg-white/10"></div>
                       </div>
                       <button 
                         type="button" 
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full h-12 border-2 border-dashed rounded-xl font-black text-[10px] uppercase tracking-widest transition ${custForm.screenshot ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-white/20 text-white/40 hover:border-white/40'}`}
                       >
                         {custForm.screenshot ? 'Proof Attached ✓' : 'Upload Payment Screenshot'}
                       </button>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScreenshotChange} />
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={!isFormValid || isOrdering}
                   className={`w-full h-16 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition active:scale-95 ${isFormValid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                 >
                   {isOrdering ? 'Confirming...' : 'Submit Order'}
                 </button>
                 
                 <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest italic leading-tight">
                   Orders are set to "Pending" until verified manually by our node operators.
                 </p>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
