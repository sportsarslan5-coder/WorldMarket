
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';

interface ShopFrontProps {
  sellers: Seller[];
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

const ADMIN_WHATSAPP = "923079490721";

const ShopFront: React.FC<ShopFrontProps> = ({ sellers = [], products = [], onPlaceOrder }) => {
  const { slug } = useParams();
  const seller = useMemo(() => sellers?.find(s => s.shopSlug === slug), [sellers, slug]);
  
  const shopProducts = useMemo(() => {
    if (!seller) return [];
    return products?.filter(p => p.sellerId === seller.id && p.published) || [];
  }, [products, seller]);
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!seller && slug) return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-[#f3f3f3]">
      <div className="text-center bg-white p-20 rounded-3xl shadow-2xl">
        <h2 className="text-6xl font-black mb-6 text-slate-900">404</h2>
        <p className="text-slate-400 font-bold text-lg mb-10">This shop link is currently inactive.</p>
        <Link to="/" className="bg-[#febd69] px-10 py-4 rounded-xl font-black text-lg shadow-xl inline-block">Return to Marketplace</Link>
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

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out "${seller?.shopName}" on PK-MART! 🇵🇰✨`;
    if (navigator.share) {
      navigator.share({ title: seller?.shopName, text: text, url: url });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    }
  };

  const submitOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Missing Information: Name, Phone, and Delivery Address are required.");
      return;
    }

    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      sellerId: seller?.id || '',
      sellerName: seller?.shopName || '',
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

    const adminLink = `${window.location.origin}/#/admin/orders`;
    const itemList = cart.map(c => `- ${c.product.name} (x${c.quantity})`).join('%0A');
    const message = `*VEO-PK ADMIN: NEW ORDER*%0A` +
                    `--------------------------%0A` +
                    `*ID:* ${orderId}%0A` +
                    `*Store:* ${seller?.shopName}%0A` +
                    `*Customer:* ${customerInfo.name}%0A` +
                    `*Phone:* ${customerInfo.phone}%0A` +
                    `*Address:* ${customerInfo.address}%0A%0A` +
                    `*Items:*%0A${itemList}%0A%0A` +
                    `*GTV:* Rs. ${total.toLocaleString()}%0A%0A` +
                    `*Review on Web:* ${adminLink}`;

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans p-6 text-center bg-white animate-in zoom-in duration-500">
        <div className="max-w-xl">
          <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl shadow-lg">✓</div>
          <h2 className="text-4xl font-black mb-4 tracking-tighter text-slate-900 uppercase">Order Confirmed!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">The Admin of <b>{seller?.shopName}</b> has been notified. We will reach out to you on WhatsApp to schedule your delivery.</p>
          <Link to="/" className="bg-[#febd69] px-12 py-5 rounded-xl font-black text-lg shadow-2xl hover:bg-[#f3a847] transition inline-block">Return to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      {/* Dynamic Nav Bar */}
      <nav className="bg-[#232f3e] text-white p-6 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-black tracking-tighter">PK-MART</Link>
            <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
            <span className="hidden md:block text-xs font-black uppercase tracking-widest text-[#febd69]">{seller?.shopName} Official Store</span>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={handleShare} className="text-xs font-black uppercase tracking-widest hover:text-[#febd69] transition flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
               Share
            </button>
            <div className="relative cursor-pointer group" onClick={() => setShowCheckout(true)}>
               <span className="absolute -top-2 -right-2 bg-[#febd69] text-[#131921] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#232f3e] group-hover:scale-110 transition">{cart.length}</span>
               <svg className="w-8 h-8 text-white group-hover:text-[#febd69] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Storefront */}
      <header className="bg-white p-16 text-center shadow-sm border-b relative">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter">{seller?.shopName}</h1>
        <div className="flex justify-center items-center gap-6">
          <span className="text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Verified Vendor
          </span>
          <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Active in Pakistan</span>
        </div>
      </header>

      {/* Product Discovery */}
      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {shopProducts.length === 0 ? (
          <div className="col-span-full py-40 text-center text-slate-300 font-bold bg-white rounded-3xl border-2 border-dashed">
            <div className="text-6xl mb-6 opacity-30">🏬</div>
            <p className="text-xl">Store is currently restocking. Check back soon!</p>
          </div>
        ) : (
          shopProducts.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-500 relative">
              <div className="h-64 bg-slate-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden p-6 relative">
                 <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                 <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-black uppercase text-slate-400 border shadow-sm">Seller Protex Active</div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-4 line-clamp-2 leading-tight tracking-tight">{p.name}</h3>
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                 <div className="flex items-baseline text-slate-900">
                    <span className="text-xs font-black mr-0.5">Rs.</span>
                    <span className="text-3xl font-black tracking-tighter">{p.price.toLocaleString()}</span>
                 </div>
                 <button 
                  onClick={() => addToCart(p)} 
                  className="bg-[#ffd814] text-[#131921] px-6 py-3 rounded-full text-xs font-black shadow-md hover:bg-[#f7ca00] transition transform active:scale-95"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Floating Share Link for Social Media */}
      <div className="fixed bottom-8 left-8 z-40">
        <button 
          onClick={handleShare}
          className="bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition group flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.115c1.556.925 3.12 1.387 4.74 1.388 5.401 0 9.795-4.393 9.798-9.795.002-2.618-1.018-5.079-2.872-6.932-1.856-1.854-4.315-2.873-6.934-2.873-5.405 0-9.8 4.393-9.802 9.795-.001 1.733.456 3.42 1.32 4.918l-.995 3.637 3.743-.982zm9.913-6.733c-.073-.121-.268-.194-.559-.34-.293-.144-1.727-.852-1.988-.948-.262-.097-.453-.144-.645.145-.19.29-.738.948-.905 1.142-.167.194-.335.219-.627.072-.293-.144-1.234-.456-2.351-1.452-.869-.774-1.456-1.73-1.627-2.02-.17-.291-.018-.448.127-.593.132-.131.293-.34.44-.51.146-.17.195-.29.293-.485.097-.194.048-.364-.024-.51-.073-.145-.645-1.554-.882-2.126-.23-.557-.464-.482-.645-.491-.166-.008-.356-.01-.545-.01-.189 0-.498.072-.757.34-.26.269-1.01 1.01-1.01 2.47 0 1.459 1.06 2.87 1.21 3.064.148.194 2.085 3.183 5.051 4.467.705.305 1.256.487 1.683.623.708.225 1.353.193 1.861.118.567-.084 1.727-.706 1.972-1.389.244-.682.244-1.265.17-1.389z"/></svg>
          <span className="hidden group-hover:inline font-black text-xs uppercase tracking-widest mr-2">Share Link</span>
        </button>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-3xl p-10 max-h-[90vh] overflow-auto animate-in slide-in-from-bottom duration-500 shadow-2xl">
              <header className="flex justify-between items-center mb-10 border-b pb-6">
                 <div>
                   <h2 className="text-3xl font-black text-slate-900">Secure Checkout</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ordering from {seller?.shopName}</p>
                 </div>
                 <button onClick={() => setShowCheckout(false)} className="text-slate-300 hover:text-red-500 text-3xl font-black transition">×</button>
              </header>
              
              {cart.length === 0 ? (
                <div className="text-center py-20">
                   <div className="text-5xl mb-4">🛒</div>
                   <p className="font-black text-slate-400 uppercase text-xs">Your bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4 max-h-[30vh] overflow-auto pr-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <img src={item.product.imageUrl} className="w-16 h-16 rounded-lg object-contain bg-white border" alt={item.product.name} />
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Quantity: {item.quantity}</p>
                          <p className="font-black text-slate-900 text-xs mt-1">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                       <span className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <input type="text" placeholder="Your Full Name" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-[#febd69] transition" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    <input type="text" placeholder="WhatsApp Phone (03xx...)" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-[#febd69] transition" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                    <textarea placeholder="Full Delivery Address (House, Street, Area, City)" className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold h-28 outline-none focus:border-[#febd69] transition" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                       <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Payment Method: Cash on Delivery Only</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-12 pt-8 border-t">
                <button onClick={() => setShowCheckout(false)} className="flex-1 py-4 bg-slate-50 rounded-xl font-black text-slate-400 hover:bg-slate-100 transition">Cancel</button>
                <button 
                  onClick={submitOrder} 
                  disabled={cart.length === 0}
                  className="flex-1 py-4 bg-[#25D366] text-white rounded-xl font-black shadow-2xl hover:bg-[#128C7E] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.747-2.874-2.512-2.96-2.626-.087-.115-.708-.943-.708-1.799 0-.856.448-1.277.607-1.441.159-.164.346-.205.462-.205.115 0 .231.001.332.006.107.005.25-.04.391.297.145.347.491 1.201.535 1.287.043.087.072.188.014.304-.058.115-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.088.275.073.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086.158.058 1.011.477 1.184.564.174.087.289.13.332.202.045.072.045.419-.1.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.957-1.302C8.369 21.503 10.113 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.724 0-3.32-.426-4.722-1.174l-.339-.18-2.553.67.683-2.491-.198-.328A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
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
