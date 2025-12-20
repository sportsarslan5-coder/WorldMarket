
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';
import { db } from '../services/db.ts';

interface ShopFrontProps {
  sellers: Seller[];
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

const ADMIN_WHATSAPP = "923079490721";

const ShopFront: React.FC<ShopFrontProps> = ({ sellers: propSellers = [], products: propProducts = [], onPlaceOrder }) => {
  const { slug } = useParams();
  const [localSellers, setLocalSellers] = useState<Seller[]>(propSellers);
  const [localProducts, setLocalProducts] = useState<Product[]>(propProducts);
  
  // Hydrate local state if props are empty (handles direct link/refresh)
  useEffect(() => {
    if (propSellers.length === 0) {
      setLocalSellers(db.getSellers());
    } else {
      setLocalSellers(propSellers);
    }
    
    if (propProducts.length === 0) {
      setLocalProducts(db.getProducts());
    } else {
      setLocalProducts(propProducts);
    }
  }, [propSellers, propProducts]);

  // High-fidelity slug resolution
  const matchedSeller = useMemo(() => {
    if (!slug || !localSellers) return null;
    return localSellers.find(s => s.shopSlug.toLowerCase() === slug.toLowerCase());
  }, [localSellers, slug]);

  const shopProducts = useMemo(() => {
    if (!matchedSeller) return [];
    return localProducts?.filter(p => 
      (p.sellerId === matchedSeller.id || p.shopId === matchedSeller.id) && 
      p.published
    ) || [];
  }, [localProducts, matchedSeller]);
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);

  // TRUE 404: Shop slug does not exist in the database
  if (!matchedSeller && slug) return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-[#f3f3f3]">
      <div className="text-center bg-white p-16 rounded-3xl shadow-2xl max-w-lg border border-slate-100 animate-in zoom-in">
        <div className="text-7xl mb-6 text-slate-200">🔍</div>
        <h2 className="text-4xl font-black mb-4 text-slate-900 tracking-tighter uppercase italic">404 - Shop Missing</h2>
        <p className="text-slate-400 font-bold text-lg mb-10 leading-relaxed">The link <b>"/{slug}"</b> does not point to an existing vendor on PK-MART.</p>
        <Link to="/" className="bg-[#febd69] px-10 py-5 rounded-xl font-black text-[#131921] shadow-xl hover:bg-[#f7ca00] transition inline-block">Explore Marketplace</Link>
      </div>
    </div>
  );

  // DEACTIVATED STATE: Shop exists but admin has paused it
  if (matchedSeller?.status === 'inactive') return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-[#f3f3f3]">
      <div className="text-center bg-white p-16 rounded-3xl shadow-2xl max-w-lg border border-slate-100 animate-in fade-in">
        <div className="text-7xl mb-6 text-slate-200">⏸️</div>
        <h2 className="text-4xl font-black mb-4 text-slate-900 tracking-tighter uppercase">Shop Paused</h2>
        <p className="text-slate-400 font-bold text-lg mb-10 leading-relaxed"><b>{matchedSeller.shopName}</b> is currently offline or undergoing maintenance by Admin.</p>
        <Link to="/" className="bg-[#febd69] px-10 py-5 rounded-xl font-black text-[#131921] shadow-xl hover:bg-[#f7ca00] transition inline-block">Return Home</Link>
      </div>
    </div>
  );

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    const existing = cart.find(c => c.product.id === product.id);
    if (existing) {
      setCart(cart.map(c => c.product.id === product.id ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const submitOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Verification Required: Delivery details are incomplete.");
      return;
    }

    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      sellerId: matchedSeller?.id || '',
      sellerName: matchedSeller?.shopName || '',
      customerName: customerInfo.name,
      customerEmail: '',
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
      items: cart.map(c => ({
        productId: c.product.id,
        productName: c.product.name,
        quantity: c.quantity,
        price: c.product.price
      })),
      totalAmount: total,
      currency: 'PKR',
      paymentMethod: PaymentMethod.COD,
      status: OrderStatus.PENDING,
      commissionAmount: total * 0.05,
      createdAt: new Date().toISOString()
    };

    const message = `*NEW ORDER FOR ${matchedSeller?.shopName.toUpperCase()}*%0A` +
                    `--------------------------%0A` +
                    `*ID:* ${orderId}%0A` +
                    `*Buyer:* ${customerInfo.name}%0A` +
                    `*Phone:* ${customerInfo.phone}%0A` +
                    `*Dropoff:* ${customerInfo.address}%0A%0A` +
                    `*Value:* Rs. ${total.toLocaleString()}%0A%0A` +
                    `*Manage at:* ${window.location.origin}/#/admin/orders`;

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans p-6 text-center bg-white">
        <div className="max-w-xl animate-in zoom-in duration-700">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl border shadow-xl">✓</div>
          <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">Success!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Your request for <b>{matchedSeller?.shopName}</b> has been received. Our Pakistan logistics team will WhatsApp you shortly.</p>
          <Link to="/" className="bg-[#febd69] px-12 py-5 rounded-xl font-black text-lg shadow-2xl hover:scale-105 transition transform">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <nav className="bg-[#232f3e] text-white p-6 sticky top-0 z-50 shadow-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-black tracking-tighter">PK-MART</Link>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest text-[#febd69] bg-[#131921] px-4 py-2 rounded-full border border-slate-700 shadow-inner">
               Live: {matchedSeller?.shopName}
            </span>
            <div className="relative cursor-pointer group" onClick={() => setShowCheckout(true)}>
               <span className="absolute -top-2 -right-2 bg-[#febd69] text-[#131921] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#232f3e] group-hover:scale-110 transition">{cart.length}</span>
               <svg className="w-8 h-8 text-white group-hover:text-[#febd69] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white p-16 text-center shadow-sm border-b">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter drop-shadow-sm">{matchedSeller?.shopName}</h1>
        <div className="flex justify-center items-center gap-4">
           <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest border px-4 py-1.5 rounded-full">Protex Secured</span>
           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
           <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Official Storefront</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {shopProducts.length === 0 ? (
          <div className="col-span-full py-40 text-center text-slate-300 font-bold bg-white rounded-3xl border-2 border-dashed animate-in fade-in">
            <div className="text-6xl mb-6 opacity-30">📦</div>
            <p className="text-xl italic">This vendor is currently setting up their gallery.</p>
          </div>
        ) : (
          shopProducts.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-500">
              <div className="h-64 bg-slate-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden p-6 relative">
                 <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                 <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase px-2 py-1 rounded shadow-sm">Verified</div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-4 line-clamp-2 leading-tight tracking-tight">{p.name}</h3>
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                 <div className="text-2xl font-black text-slate-900 tracking-tighter">Rs. {p.price.toLocaleString()}</div>
                 <button onClick={() => addToCart(p)} className="bg-[#ffd814] text-[#131921] px-6 py-3 rounded-full text-[10px] font-black shadow-md hover:bg-[#f7ca00] transition active:scale-95">Add to Bag</button>
              </div>
            </div>
          ))
        )}
      </main>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-3xl p-10 max-h-[90vh] overflow-auto shadow-2xl animate-in slide-in-from-bottom duration-500">
              <header className="flex justify-between items-center mb-10 border-b pb-6">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900">Secure Checkout</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Billing for {matchedSeller?.shopName}</p>
                 </div>
                 <button onClick={() => setShowCheckout(false)} className="text-slate-300 hover:text-red-500 text-3xl font-black transition">×</button>
              </header>
              
              <div className="space-y-8">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-slate-300 font-black italic uppercase text-xs">Bag is empty</div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-48 overflow-auto pr-2">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border">
                          <img src={item.product.imageUrl} className="w-16 h-16 rounded-lg object-contain bg-white border" alt={item.product.name} />
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 text-sm truncate">{item.product.name}</p>
                            <p className="text-slate-400 text-[10px] font-black uppercase">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-black text-slate-900">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t flex justify-between items-center">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                       <span className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {total.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <input type="text" placeholder="Full Name" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-[#febd69] transition" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                      <input type="text" placeholder="WhatsApp Number" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-[#febd69] transition" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                      <textarea placeholder="Delivery Address" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold h-28 outline-none focus:border-[#febd69] transition" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                        <p className="text-[10px] font-black text-orange-600 uppercase">Cash on Delivery Available Nationwide</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t">
                <button onClick={() => setShowCheckout(false)} className="flex-1 py-4 bg-slate-50 rounded-xl font-black text-slate-400 transition hover:bg-slate-100">Cancel</button>
                <button 
                  onClick={submitOrder} 
                  disabled={cart.length === 0}
                  className="flex-1 py-4 bg-[#25D366] text-white rounded-xl font-black shadow-2xl hover:bg-[#128C7E] transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Confirm on WhatsApp
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
