
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';
import { api } from '../services/api.ts';

interface ShopFrontProps {
  sellers: Seller[];
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

const ADMIN_WHATSAPP_NUMBER = "923079490721";

const ShopFront: React.FC<ShopFrontProps> = ({ sellers: propSellers, products: propProducts, onPlaceOrder }) => {
  const { slug } = useParams();
  const [localSellers, setLocalSellers] = useState<Seller[]>(propSellers);
  const [localProducts, setLocalProducts] = useState<Product[]>(propProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (propSellers.length === 0) {
        const s = await api.fetchSellers();
        setLocalSellers(s);
      } else {
        setLocalSellers(propSellers);
      }
      
      if (propProducts.length === 0) {
        const p = await api.fetchProducts();
        setLocalProducts(p);
      } else {
        setLocalProducts(propProducts);
      }
    };
    fetchData();
  }, [propSellers, propProducts]);

  const seller = useMemo(() => {
    if (!slug || !localSellers) return null;
    return localSellers.find(s => s.shopSlug.toLowerCase() === slug.toLowerCase());
  }, [localSellers, slug]);

  const shopProducts = useMemo(() => {
    if (!seller) return [];
    return localProducts?.filter(p => (p.sellerId === seller.id || p.shopId === seller.id) && p.published) || [];
  }, [localProducts, seller]);

  const [cart, setCart] = useState<{product: Product, quantity: number, size?: string}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const addToCart = (product: Product, size?: string) => {
    const existing = cart.find(c => c.product.id === product.id && c.size === size);
    if (existing) {
      setCart(cart.map(c => (c.product.id === product.id && c.size === size) ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, { product, quantity: 1, size }]);
    }
    setSelectedProduct(null);
    setSelectedSize('');
  };

  const submitOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Missing delivery details. Verification required.");
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
        productImageUrl: c.product.imageUrl,
        quantity: c.quantity,
        price: c.product.price,
        size: c.size
      })),
      totalAmount: total,
      currency: 'PKR',
      paymentMethod: PaymentMethod.COD,
      status: OrderStatus.PENDING,
      commissionAmount: total * 0.05,
      createdAt: new Date().toISOString()
    };

    // Constructing the detailed WhatsApp notification for Admin
    const itemsDescription = cart.map(item => 
      `📦 *${item.product.name}*\n` +
      `   Price: Rs. ${item.product.price}\n` +
      `   Qty: ${item.quantity}\n` +
      `   Size: ${item.size || 'N/A'}\n` +
      `   🖼️ Image: ${item.product.imageUrl}`
    ).join('\n\n');
    
    const whatsappMessage = window.encodeURIComponent(
      `*🚨 PK-MART: URGENT NEW ORDER 🚨*\n\n` +
      `*ORDER ID:* ${orderId}\n` +
      `*VENDOR:* ${seller?.shopName}\n` +
      `*TOTAL:* Rs. ${total.toLocaleString()}\n\n` +
      `*--- ITEMS ORDERED ---*\n` +
      `${itemsDescription}\n\n` +
      `*--- CUSTOMER DATA ---*\n` +
      `👤 *Name:* ${customerInfo.name}\n` +
      `📞 *Phone:* ${customerInfo.phone}\n` +
      `📍 *Address:* ${customerInfo.address}\n\n` +
      `⚠️ *LOG INTO ADMIN PANEL TO PROCESS.*`
    );

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
    
    // Automatic Background Trigger via browser redirect/open
    window.open(`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${whatsappMessage}`, '_blank');
  };

  if (!seller && slug) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl mb-6 opacity-10">🏙️</div>
      <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Shop Not Found</h2>
      <p className="text-slate-400 font-bold mb-10 max-w-sm mx-auto leading-relaxed">The vendor link <b>/{slug}</b> does not exist in our global node.</p>
      <Link to="/" className="bg-[#febd69] px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-black hover:text-white transition">Back to PK-MART</Link>
    </div>
  );

  if (orderPlaced) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-5xl mb-12 shadow-xl border border-emerald-100">✓</div>
      <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Verified!</h2>
      <p className="text-slate-500 font-bold max-w-md mb-12 leading-relaxed">Your order for <b>{seller?.shopName}</b> has been locked into our database. The Admin has been notified via WhatsApp.</p>
      <Link to="/" className="bg-[#febd69] px-12 py-6 rounded-2xl font-black text-lg shadow-2xl transition hover:scale-105 transform active:scale-95">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20">
      <nav className="bg-[#131921] text-white p-6 sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
            PK<span className="text-[#febd69]">-</span>MART
          </Link>
          <div className="flex items-center gap-8">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#febd69] border border-white/10 px-6 py-2 rounded-full hidden md:block">{seller?.shopName}</span>
            <button onClick={() => setShowCheckout(true)} className="relative group">
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#131921] group-hover:scale-110 transition">{cart.length}</span>
              <svg className="w-7 h-7 text-white group-hover:text-[#febd69] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <header className="bg-white py-24 px-6 text-center border-b shadow-sm relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">Verified Pakistani Vendor</p>
           <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic drop-shadow-sm">{seller?.shopName}</h1>
           <div className="flex justify-center items-center gap-6">
              <span className="bg-emerald-500 w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Global Node Online</span>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {shopProducts.map(p => (
          <div key={p.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-700">
             <div className="h-72 bg-slate-50 rounded-[30px] mb-8 overflow-hidden p-8 relative flex items-center justify-center">
                <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-1000" alt={p.name} />
                <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl text-[9px] font-black text-slate-500 uppercase shadow-sm">Stock: {p.stock}</div>
             </div>
             <h3 className="font-black text-2xl mb-4 line-clamp-2 leading-tight tracking-tight text-slate-900">{p.name}</h3>
             <div className="mt-auto pt-8 flex flex-col gap-6 border-t border-slate-50">
                <div className="text-4xl font-black text-slate-900 tracking-tighter flex items-baseline gap-1">
                   <span className="text-xs font-black uppercase text-slate-300">Rs.</span>
                   {p.price.toLocaleString()}
                </div>
                <button 
                  onClick={() => setSelectedProduct(p)} 
                  className="w-full bg-[#ffd814] text-[#131921] py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black hover:text-white transition active:scale-95"
                >
                  View Options
                </button>
             </div>
          </div>
        ))}
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-5xl rounded-[60px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-500">
              <div className="md:w-1/2 bg-slate-50 p-16 flex items-center justify-center border-r border-slate-100">
                <img src={selectedProduct.imageUrl} className="max-w-full max-h-[500px] object-contain drop-shadow-3xl transform hover:rotate-2 transition duration-700" alt={selectedProduct.name} />
              </div>
              <div className="md:w-1/2 p-16 flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <div>
                     <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase italic">{selectedProduct.name}</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category: {selectedProduct.category}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="text-slate-200 hover:text-red-500 text-5xl font-black transition leading-none">×</button>
                </div>
                <p className="text-slate-500 font-bold mb-12 leading-relaxed text-lg">{selectedProduct.description}</p>
                
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="mb-12">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 block">Select Size Variant</label>
                    <div className="flex flex-wrap gap-4">
                       {selectedProduct.sizes.map(size => (
                         <button 
                           key={size}
                           onClick={() => setSelectedSize(size)}
                           className={`px-8 py-4 rounded-2xl border-2 font-black transition text-sm ${selectedSize === size ? 'bg-[#131921] text-white border-[#131921] shadow-2xl' : 'border-slate-100 text-slate-300 hover:border-[#febd69]'}`}
                         >
                           {size}
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-12 border-t flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Final Price</p>
                     <div className="text-5xl font-black text-slate-900 tracking-tighter">Rs. {selectedProduct.price.toLocaleString()}</div>
                  </div>
                  <button 
                    disabled={selectedProduct.sizes.length > 0 && !selectedSize}
                    onClick={() => addToCart(selectedProduct, selectedSize)}
                    className="bg-[#25D366] text-white px-12 py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-[#128C7E] transition disabled:opacity-20 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex justify-end">
           <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              <header className="p-12 border-b flex justify-between items-center bg-slate-50">
                 <div>
                    <h2 className="text-4xl font-black tracking-tighter italic uppercase">Your Bag</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Vendor: {seller?.shopName}</p>
                 </div>
                 <button onClick={() => setShowCheckout(false)} className="text-slate-200 hover:text-red-500 text-5xl font-black transition">×</button>
              </header>

              <div className="flex-1 overflow-auto p-12 space-y-8">
                 {cart.length === 0 ? (
                   <div className="text-center py-40 opacity-20">
                      <div className="text-9xl mb-8">🎒</div>
                      <p className="text-xs font-black uppercase tracking-[0.5em]">Bag is Empty</p>
                   </div>
                 ) : (
                   cart.map((item, idx) => (
                     <div key={idx} className="flex gap-6 items-center bg-slate-50 p-8 rounded-[32px] border border-slate-100 relative group shadow-sm hover:shadow-md transition">
                        <img src={item.product.imageUrl} className="w-20 h-20 rounded-2xl object-contain bg-white border border-slate-100" alt={item.product.name} />
                        <div className="flex-1">
                          <p className="font-black text-slate-900 uppercase italic text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-[9px] font-black uppercase text-slate-400 mt-2 tracking-widest bg-white inline-block px-3 py-1 rounded-full border">
                            {item.size ? `Size: ${item.size}` : 'Standard'} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="font-black text-slate-900 text-lg tracking-tighter">Rs. {(item.product.price * item.quantity).toLocaleString()}</div>
                     </div>
                   ))
                 )}
              </div>

              {cart.length > 0 && (
                <div className="p-12 bg-white border-t space-y-10 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Total Payable</span>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter italic">Rs. {total.toLocaleString()}</span>
                   </div>
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <input type="text" placeholder="Full Name" className="w-full p-6 rounded-2xl border-2 border-slate-100 font-black focus:border-[#febd69] outline-none transition bg-slate-50" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                        <input type="text" placeholder="WhatsApp Phone (03XX...)" className="w-full p-6 rounded-2xl border-2 border-slate-100 font-black focus:border-[#febd69] outline-none transition bg-slate-50" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                      </div>
                      <textarea placeholder="Complete Delivery Address" className="w-full p-6 rounded-2xl border-2 border-slate-100 font-black h-32 focus:border-[#febd69] outline-none transition bg-slate-50" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                   </div>
                   <button onClick={submitOrder} className="w-full py-7 bg-[#25D366] text-white rounded-[32px] font-black text-xl shadow-2xl hover:bg-[#128C7E] transition transform hover:scale-[1.02] active:scale-95 uppercase italic tracking-widest">Confirm Order</button>
                   <div className="flex items-center justify-center gap-4 py-2 opacity-30">
                      <div className="h-px w-8 bg-slate-300"></div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cash on Delivery • Secure Node</p>
                      <div className="h-px w-8 bg-slate-300"></div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
