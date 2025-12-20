
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
  const [shopSearch, setShopSearch] = useState('');
  
  const shopProducts = useMemo(() => {
    if (!seller) return [];
    return products?.filter(p => 
      p.sellerId === seller.id && 
      p.published && 
      p.name.toLowerCase().includes(shopSearch.toLowerCase())
    ) || [];
  }, [products, seller, shopSearch]);
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', address: '', method: PaymentMethod.COD });
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Defensive check to prevent white screen if seller not found or loading
  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] p-10 text-center font-sans">
      <div className="bg-white p-20 rounded-xl shadow-2xl max-w-lg">
        <h2 className="text-7xl font-black text-slate-900 mb-6">404</h2>
        <p className="text-slate-500 font-bold mb-10 text-xl italic leading-relaxed">Shop not found. It might be currently offline or deactivated.</p>
        <Link to="/" className="bg-[#febd69] px-10 py-4 rounded-md font-black text-[#131921]">Marketplace Home</Link>
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
      alert("Required Field Missing: Please provide your name, WhatsApp, and delivery address.");
      return;
    }

    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      sellerId: seller.id,
      sellerName: seller.shopName,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
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
      paymentMethod: customerInfo.method,
      status: OrderStatus.PENDING,
      commissionAmount: total * 0.05,
      createdAt: new Date().toISOString()
    };

    // Construct WhatsApp Message for Admin
    const itemList = cart.map(c => `- ${c.product.name} x${c.quantity} (Rs. ${c.product.price})`).join('%0A');
    const message = `Hi PK-MART Admin, I want to place an order.%0A%0A` +
                    `*Order ID:* ${orderId}%0A` +
                    `*Shop:* ${seller.shopName}%0A%0A` +
                    `*Customer Details:*%0A` +
                    `- Name: ${customerInfo.name}%0A` +
                    `- Phone: ${customerInfo.phone}%0A` +
                    `- Address: ${customerInfo.address}%0A%0A` +
                    `*Items:*%0A${itemList}%0A%0A` +
                    `*Total Amount:* Rs. ${total.toLocaleString()}%0A` +
                    `*Payment:* ${customerInfo.method}`;

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);

    // Open WhatsApp to notify Admin
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10 animate-in fade-in zoom-in font-sans">
        <div className="max-w-2xl w-full text-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 text-4xl shadow-lg shadow-green-100/50">✓</div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">ORDER SENT!</h2>
          <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">Your order for <b>{seller.shopName}</b> has been sent to the Admin for final processing. You will receive a WhatsApp message from us shortly for delivery confirmation.</p>
          <Link to="/" className="bg-[#febd69] text-[#131921] px-12 py-5 rounded-md font-black text-lg shadow-xl hover:bg-[#f3a847] transition">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-20 font-sans">
      <nav className="bg-[#232f3e] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-6">
          <Link to="/" className="text-xl font-black text-white px-2">
            PK<span className="text-[#febd69]">-</span>MART
          </Link>
          <div className="flex-1 flex w-full">
            <div className="bg-[#f3f3f3] text-[#232f3e] px-4 rounded-l-md flex items-center font-black text-[10px] border-r border-slate-300">
              {seller.shopName.toUpperCase()}
            </div>
            <input 
              type="text" 
              placeholder={`Search in this shop...`} 
              className="flex-1 p-3 outline-none text-slate-900 font-bold"
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
            />
            <button className="bg-[#febd69] p-3 rounded-r-md hover:bg-[#f3a847] transition">
              <svg className="w-6 h-6 text-[#131921]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer group" onClick={() => setShowCheckout(true)}>
               <span className="absolute -top-2 -right-2 bg-[#febd69] text-[#131921] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#232f3e]">{cart.length}</span>
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white border-b border-slate-200 p-12 text-center mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{seller.shopName}</h1>
        <div className="flex justify-center items-center gap-6">
          <span className="text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full">Official Vendor</span>
          <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Lahore, PK</span>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <main className="lg:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {shopProducts.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col group hover:shadow-xl transition-all duration-500">
                <div className="h-64 mb-6 overflow-hidden flex items-center justify-center">
                  <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                </div>
                <div className="space-y-2 mb-8">
                  <h3 className="font-bold text-xl text-slate-900 line-clamp-2 leading-tight tracking-tight">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex text-[#febd69]">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(p.rating) ? 'fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-baseline text-slate-900">
                    <span className="text-xs font-black mr-0.5">Rs.</span>
                    <span className="text-3xl font-black">{p.price?.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    className="bg-[#ffd814] text-[#131921] px-6 py-3 rounded-full text-xs font-black shadow-md hover:bg-[#f7ca00] transition transform active:scale-95"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="lg:col-span-3">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 sticky top-28">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span>Your Cart</span>
              <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full font-black uppercase">{cart.length}</span>
            </h2>
            
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4 opacity-30 grayscale">
                <div className="text-5xl">🛒</div>
                <p className="text-[10px] font-black uppercase tracking-widest">Bag is empty</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4 max-h-[40vh] overflow-auto pr-2">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 items-center border-b border-slate-100 pb-4">
                      <img src={item.product.imageUrl} className="w-16 h-16 rounded-md object-contain border bg-[#f8f8f8]" alt={item.product.name} />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-xs line-clamp-1">{item.product.name}</p>
                        <p className="text-slate-400 text-[10px] font-bold">Qty: {item.quantity}</p>
                        <p className="font-black text-slate-900 text-xs mt-1">Rs. { (item.product.price * item.quantity).toLocaleString() }</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-6 pt-4">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Subtotal</span>
                     <span className="font-black text-2xl text-slate-900">Rs. {total.toLocaleString()}</span>
                   </div>
                   {!showCheckout ? (
                     <button onClick={() => setShowCheckout(true)} className="w-full py-5 rounded-md font-black text-[#131921] bg-[#ffd814] shadow-md hover:bg-[#f7ca00] transition">Confirm Orders</button>
                   ) : (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                       <input 
                         type="text" placeholder="Full Name" className="w-full border-slate-200 bg-slate-50 p-4 rounded-md font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 border" 
                         value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                       />
                       <input 
                         type="text" placeholder="WhatsApp Number" className="w-full border-slate-200 bg-slate-50 p-4 rounded-md font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 border" 
                         value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                       />
                       <textarea 
                         placeholder="Delivery Address" className="w-full border-slate-200 bg-slate-50 p-4 rounded-md font-bold text-sm h-32 outline-none focus:ring-2 focus:ring-blue-500 border" 
                         value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                       />
                       <button 
                         onClick={submitOrder}
                         className="w-full bg-[#25D366] py-5 rounded-md font-black text-white shadow-xl hover:bg-[#128C7E] transition flex items-center justify-center gap-3"
                       >
                         Place Order via WhatsApp
                       </button>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ShopFront;
