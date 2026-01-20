
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
    paymentMethod: 'JazzCash' as 'COD' | 'JazzCash',
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

  const handleInitiatePayment = () => {
    if (!selectedProduct || !custForm.address || !custForm.name) {
      alert("Please fill your Name and Delivery Address first.");
      return;
    }
    
    const amount = selectedProduct.price;
    const message = `JAZZCASH ORDER: I am paying Rs. ${amount.toLocaleString()} for ${selectedProduct.name}.\nMerchant: ${MERCHANT_NUMBER}\nCustomer: ${custForm.name}\nAddress: ${custForm.address}`;
    
    // Redirect to WhatsApp/JazzCash relay
    const waUrl = `https://wa.me/${MERCHANT_NUMBER.replace(/^0/, '92')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    
    setPaymentStep('waiting');
    
    // Simulate verification after 6 seconds
    setTimeout(() => {
      setPaymentStep('verified');
    }, 6000);
  };

  const handleFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct || paymentStep !== 'verified') return;
    
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
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    await api.placeOrder(order);
    
    alert("ORDER COMPLETED! Payment Verified for JazzCash Account 03079490721.");
    setSelectedProduct(null);
    setPaymentStep('initial');
    setIsOrdering(false);
    setCustForm({ name: '', phone: '', address: '', paymentMethod: 'JazzCash' });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100">
      <nav className="p-6 h-16 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="text-xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></Link>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">Secure Hub</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
           <div>
             <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">{shop?.name}</h1>
             <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">{products.length} Items Listed</p>
           </div>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto" onClick={() => { if(paymentStep !== 'waiting') setSelectedProduct(null) }}>
           <div className="bg-white p-8 md:p-12 rounded-[40px] max-w-2xl w-full relative shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
              {paymentStep !== 'waiting' && <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition text-2xl">✕</button>}
              
              <div className="flex gap-6 mb-10 items-center border-b border-slate-50 pb-8">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-2">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight italic">{selectedProduct.name}</h2>
                  <p className="text-green-600 font-black text-2xl italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                 <input required placeholder="Full Name" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} disabled={paymentStep === 'waiting'} />
                 <textarea required placeholder="Complete Delivery Address" className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold resize-none" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} disabled={paymentStep === 'waiting'} />
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                 {paymentStep === 'initial' && (
                    <button 
                      type="button"
                      onClick={handleInitiatePayment}
                      className="w-full h-14 bg-[#D32F2F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition active:scale-95 shadow-xl shadow-red-900/20"
                    >
                      Pay via JazzCash (03079490721)
                    </button>
                 )}

                 {paymentStep === 'waiting' && (
                    <div className="text-center py-4">
                       <div className="w-10 h-10 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest animate-pulse">Waiting for JazzCash Signal...</p>
                    </div>
                 )}

                 {paymentStep === 'verified' && (
                    <div className="text-center py-4">
                       <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-green-500/20">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                       </div>
                       <p className="text-[10px] font-black uppercase text-green-600 tracking-widest">Payment Confirmed!</p>
                    </div>
                 )}
              </div>

              <button 
                onClick={handleFinalizeOrder}
                disabled={paymentStep !== 'verified' || isOrdering}
                className={`w-full h-16 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl transition active:scale-95 ${paymentStep === 'verified' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
              >
                {isOrdering ? 'Confirming...' : 'Complete Order'}
              </button>
              
              <p className="text-[9px] text-center font-bold text-slate-400 mt-6 uppercase tracking-widest italic">
                {paymentStep === 'initial' ? "Complete address to enable JazzCash payment" : "Button enables after payment is verified by PK MART nodes"}
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
