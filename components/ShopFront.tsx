
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const ShopFront: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form States for 2Checkout flow
  const [custForm, setCustForm] = useState({ 
    name: '', 
    email: '',
    phone: '', 
    address: '',
  });

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

  const handleStartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct) return;
    
    setIsProcessing(true);
    const orderId = 'PK-' + Math.random().toString(36).substr(2, 8).toUpperCase();

    const order: Order = {
      id: orderId,
      shopId: shop.id,
      shopName: shop.name,
      sellerWhatsApp: shop.whatsappNumber,
      customerName: custForm.name,
      customerEmail: custForm.email,
      customerPhone: custForm.phone,
      customerAddress: custForm.address,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: 1,
        price: selectedProduct.price
      }],
      totalAmount: selectedProduct.price,
      paymentMethod: '2Checkout',
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await api.initOrder(order);
    
    // Redirect to the simulated 2Checkout Secure Gateway
    setTimeout(() => {
      navigate(`/checkout-gateway/${orderId}`);
    }, 800);
  };

  const isFormValid = custForm.name && custForm.email && custForm.phone && custForm.address;

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100">
      <nav className="p-6 h-16 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="text-xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></Link>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">Secure Global Payments</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
           <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">{shop?.name}</h1>
           <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Verified PK MART Global Vendor</p>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto" onClick={() => !isProcessing && setSelectedProduct(null)}>
           <div className="bg-white p-8 md:p-12 rounded-[40px] max-w-2xl w-full relative shadow-2xl animate-fade-in my-10" onClick={e => e.stopPropagation()}>
              {!isProcessing && <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition text-2xl">✕</button>}
              
              <div className="flex gap-6 mb-10 items-center border-b border-slate-50 pb-8">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-2">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight italic">{selectedProduct.name}</h2>
                  <p className="text-green-600 font-black text-2xl italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleStartCheckout} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                      <input required placeholder="Full Name" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-green-600/20" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</label>
                      <input required type="email" placeholder="customer@global.com" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-green-600/20" value={custForm.email} onChange={e => setCustForm({...custForm, email: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                      <input required placeholder="03XXXXXXXXX" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-green-600/20" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1 flex flex-col justify-end">
                      <div className="h-14 flex items-center gap-3 bg-slate-50 px-5 rounded-2xl border border-slate-100">
                         <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-5" alt="Visa" />
                         <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-5" alt="Mastercard" />
                         <span className="text-[9px] font-black text-slate-400 uppercase">Secure Card Entry via 2Checkout</span>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Complete Shipping Address</label>
                    <textarea required placeholder="House #, Street, City, Country" className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold resize-none focus:ring-2 focus:ring-green-600/20" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                 </div>

                 <div className="bg-slate-900 text-white p-8 rounded-[32px] space-y-4">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Account</p>
                       <p className="text-xs font-black uppercase tracking-widest text-green-400">Verifone (2Checkout) Secured</p>
                    </div>
                    <div className="flex justify-between items-end">
                       <p className="text-3xl font-black italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase text-right leading-tight">Total payable including <br/>global processing fees.</p>
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={!isFormValid || isProcessing}
                   className={`w-full h-16 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition active:scale-95 flex items-center justify-center gap-3 ${isFormValid && !isProcessing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                 >
                   {isProcessing ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       Opening Secure Gateway...
                     </>
                   ) : 'Secure Worldwide Payment'}
                 </button>
                 
                 <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest italic leading-tight">
                   You will be redirected to 2Checkout (Verifone) for secure card payment. <br/>PK MART does not store your card details.
                 </p>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
