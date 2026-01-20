
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
  
  const [custForm, setCustForm] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    paymentMethod: 'JazzCash' as 'COD' | 'JazzCash' | 'Bank',
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

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct) return;
    
    setIsOrdering(true);
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const merchantJazzCash = "03079490721";

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
      status: 'pending'
    };

    // Save order to database
    await api.placeOrder(order);

    if (custForm.paymentMethod === 'JazzCash') {
      // Create WhatsApp Redirect Link
      const message = `Hello PK MART! 🇵🇰\n\nI want to pay for Order: *${orderId}*\nAmount: *Rs. ${order.totalAmount.toLocaleString()}*\nProduct: ${selectedProduct.name}\n\nI am sending payment to your JazzCash: *${merchantJazzCash}*\n\nMy Details:\nName: ${custForm.name}\nPhone: ${custForm.phone}`;
      const waUrl = `https://wa.me/${merchantJazzCash.replace(/^0/, '92')}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp and close modal
      window.open(waUrl, '_blank');
      alert("Redirecting to WhatsApp to complete your JazzCash payment. Please send the screenshot there!");
    } else {
      alert("Order Request Sent! Thank you for shopping with PK MART.");
    }

    setSelectedProduct(null);
    setIsOrdering(false);
    setCustForm({ name: '', phone: '', address: '', paymentMethod: 'JazzCash' });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
      <h1 className="text-3xl font-black mb-6 uppercase tracking-tighter italic">Shop Not Found</h1>
      <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Back to PK MART</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-green-100 font-sans">
      <nav className="p-6 h-16 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-50">
        <Link to="/" className="text-xl font-black italic tracking-tighter uppercase">PK<span className="text-green-600">MART</span></Link>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-full">Secure Payments Enabled</span>
      </nav>

      <header className="bg-slate-50 py-24 px-6 text-center border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">{shop.name}</h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">{shop.description}</p>
        </div>
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
                <button 
                  onClick={() => setSelectedProduct(p)} 
                  className="mt-auto w-full bg-slate-900 text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition shadow-lg active:scale-95"
                >
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-end md:items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedProduct(null)}>
           <div className="bg-white p-6 md:p-10 rounded-t-[40px] md:rounded-[40px] max-w-2xl w-full relative shadow-2xl my-auto animate-fade-in" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-8 text-slate-300 hover:text-slate-900 transition text-2xl">✕</button>
              
              <div className="flex gap-6 mb-8 items-center border-b border-slate-50 pb-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight italic leading-tight">{selectedProduct.name}</h2>
                  <p className="text-green-600 font-black text-lg italic">Rs. {selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Your Full Name" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
                    <input required placeholder="Your WhatsApp Number" className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
                 </div>
                 <textarea required placeholder="Delivery Address in Pakistan" className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm resize-none" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                 
                 <div className="py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Select Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                       {['JazzCash', 'COD'].map(method => (
                         <button 
                           key={method}
                           type="button"
                           onClick={() => setCustForm({...custForm, paymentMethod: method as any})}
                           className={`h-12 rounded-2xl text-[10px] font-black uppercase border transition-all ${custForm.paymentMethod === method ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                         >
                           {method === 'JazzCash' ? 'Pay to 03079490721' : method}
                         </button>
                       ))}
                    </div>
                 </div>

                 <button disabled={isOrdering} className="w-full bg-green-600 text-white h-16 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-green-700 transition active:scale-95 disabled:opacity-50 mt-4">
                   {isOrdering ? 'Saving Order...' : (custForm.paymentMethod === 'JazzCash' ? 'Pay Now via WhatsApp' : 'Complete Order')}
                 </button>
                 <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">Secure Checkout via PK MART Cloud</p>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
