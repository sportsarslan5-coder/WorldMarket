
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
  
  // Payment Flow States
  const [paymentStep, setPaymentStep] = useState<'initial' | 'waiting' | 'verified'>('initial');
  const [isOrdering, setIsOrdering] = useState(false);
  
  const [custForm, setCustForm] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    paymentMethod: 'JazzCash' as 'COD' | 'JazzCash' | 'Bank',
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

  // Step 1: Redirect user to Pay
  const handleInitiatePayment = () => {
    if (!selectedProduct) return;
    
    const amount = selectedProduct.price;
    const message = `ORDER PAYMENT: I am paying Rs. ${amount.toLocaleString()} to ${MERCHANT_NUMBER} for my order of ${selectedProduct.name}. My name is ${custForm.name}.`;
    
    // Redirecting to WhatsApp as the relay to the Merchant Number
    const waUrl = `https://wa.me/${MERCHANT_NUMBER.replace(/^0/, '92')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    
    // Move to waiting state
    setPaymentStep('waiting');
    
    // In a real app, we would poll an API here. 
    // We'll simulate a 5-second "verification" delay for this demo.
    setTimeout(() => {
      setPaymentStep('verified');
    }, 5000);
  };

  // Step 2: Finalize the Order
  const handleFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct || paymentStep !== 'verified') return;
    
    setIsOrdering(true);
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();

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
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'completed' // Requirement: Status updates to Completed upon clicking
    };

    await api.placeOrder(order);
    
    alert("🎉 Order Completed Successfully! Payment Verified for " + MERCHANT_NUMBER);
    setSelectedProduct(null);
    setPaymentStep('initial');
    setIsOrdering(false);
    setCustForm({ name: '', phone: '', address: '', paymentMethod: 'JazzCash' });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100">
      <nav className="p-6 h-16 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="text-xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></Link>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">Secure Payments Hub</span>
      </nav>

      <header className="bg-slate-50 py-24 px-6 text-center border-b border-slate-100">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">{shop?.name}</h1>
        <p className="text-lg text-slate-500 font-medium mt-4">{shop?.description}</p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group animate-fade-in flex flex-col">
              <div className="aspect-[4/5] bg-slate-50 rounded-[40px] flex items-center justify-center p-8 overflow-hidden relative group-hover:shadow-xl transition-all duration-500">
                <img src={p.imageUrl} className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-700" alt={p.name} />
              </div>
              <div className="mt-6 flex-1 flex flex-col">
                <h3 className="font-bold text-lg uppercase tracking-tight mb-1">{p.name}</h3>
                <p className="text-xl font-black text-green-600 italic mb-4">Rs. {p.price.toLocaleString()}</p>
                <button onClick={() => setSelectedProduct(p)} className="mt-auto w-full bg-slate-900 text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition shadow-lg">Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedProduct(null)}>
           <div className="bg-white p-8 md:p-12 rounded-[40px] max-w-2xl w-full relative shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
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

              <form onSubmit={handleFinalizeOrder} className="space-y-6">
                 <div className="space-y-4">
                    <input required placeholder="Your Name" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
                    <textarea required placeholder="Delivery Address in Pakistan" className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm resize-none" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                 </div>
                 
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Payment Procedure</p>
                    
                    {paymentStep === 'initial' && (
                      <button 
                        type="button"
                        onClick={handleInitiatePayment}
                        className="w-full h-14 bg-[#D32F2F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition active:scale-95 shadow-lg shadow-red-900/20"
                      >
                        Pay Rs. {selectedProduct.price.toLocaleString()} via JazzCash
                      </button>
                    )}

                    {paymentStep === 'waiting' && (
                      <div className="flex flex-col items-center py-4 space-y-4">
                        <div className="w-10 h-10 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Verifying Payment on {MERCHANT_NUMBER}...</p>
                        <p className="text-[9px] text-slate-400 italic">Checking JazzCash transaction nodes. Please wait.</p>
                      </div>
                    )}

                    {paymentStep === 'verified' && (
                      <div className="flex flex-col items-center py-4 space-y-3">
                        <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                        <p className="text-[11px] font-black text-green-600 uppercase tracking-widest">Payment Confirmed!</p>
                      </div>
                    )}
                 </div>

                 <button 
                   type="submit"
                   disabled={paymentStep !== 'verified' || isOrdering} 
                   className={`w-full h-16 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${paymentStep === 'verified' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                 >
                   {isOrdering ? 'Finalizing...' : 'Complete Order'}
                 </button>
                 
                 {paymentStep === 'initial' && (
                   <p className="text-[10px] text-center font-bold text-slate-400 italic">Clicking 'Pay' will open instructions to pay {MERCHANT_NUMBER}</p>
                 )}
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
