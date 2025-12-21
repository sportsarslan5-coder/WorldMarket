
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';
import { api } from '../services/api.ts';

interface ShopFrontProps {
  sellers: Seller[];
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

const ADMIN_WHATSAPP = "923079490721";

const ShopFront: React.FC<ShopFrontProps> = ({ sellers: propSellers, products: propProducts, onPlaceOrder }) => {
  const { slug } = useParams();
  const [localSellers, setLocalSellers] = useState<Seller[]>(propSellers);
  const [localProducts, setLocalProducts] = useState<Product[]>(propProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Critical Sync: Ensure data is fetched even if prop is empty (direct links)
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
      alert("Please enter full delivery details.");
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

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=New Order ${orderId} for ${seller?.shopName}`, '_blank');
  };

  if (!seller && slug) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl mb-4 opacity-20">🏝️</div>
      <h2 className="text-4xl font-black text-slate-900 mb-2">Shop Not Found</h2>
      <p className="text-slate-400 font-bold mb-8">The vendor link <b>/{slug}</b> does not exist or has been removed.</p>
      <Link to="/" className="bg-[#febd69] px-10 py-4 rounded-xl font-black shadow-xl">Back to PK-MART</Link>
    </div>
  );

  if (orderPlaced) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-5xl mb-10 shadow-xl">✓</div>
      <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Order Received!</h2>
      <p className="text-slate-500 font-medium max-w-md mb-10">We have sent your order details for <b>{seller?.shopName}</b> to our admin team. You will be contacted via WhatsApp shortly.</p>
      <Link to="/" className="bg-[#febd69] px-12 py-5 rounded-xl font-black text-lg shadow-2xl transition hover:scale-105">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20">
      <nav className="bg-[#131921] text-white p-6 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter">PK-MART</Link>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#febd69] border border-slate-700 px-4 py-2 rounded-full hidden md:block">{seller?.shopName} • LIVE</span>
            <button onClick={() => setShowCheckout(true)} className="relative group">
              <span className="absolute -top-2 -right-2 bg-[#febd69] text-[#131921] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#131921] group-hover:scale-110 transition">{cart.length}</span>
              <svg className="w-8 h-8 text-white group-hover:text-[#febd69] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <header className="bg-white py-20 px-6 text-center border-b shadow-sm relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">{seller?.shopName}</h1>
           <div className="flex justify-center items-center gap-4">
              <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authentic Vendor • Pakistan</span>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {shopProducts.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col group hover:shadow-2xl transition-all duration-500">
             <div className="h-64 bg-slate-50 rounded-2xl mb-6 overflow-hidden p-6 relative flex items-center justify-center">
                <img src={p.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-700" alt={p.name} />
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase px-2 py-1 rounded">Stock: {p.stock}</div>
             </div>
             <h3 className="font-bold text-xl mb-4 line-clamp-2 leading-tight tracking-tight">{p.name}</h3>
             <div className="mt-auto pt-6 flex flex-col gap-4 border-t">
                <div className="text-3xl font-black text-slate-900 tracking-tighter">Rs. {p.price.toLocaleString()}</div>
                <button 
                  onClick={() => setSelectedProduct(p)} 
                  className="w-full bg-[#ffd814] text-[#131921] py-4 rounded-xl font-black text-xs shadow-md hover:bg-[#f7ca00] transition active:scale-95"
                >
                  View Options
                </button>
             </div>
          </div>
        ))}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
              <div className="md:w-1/2 bg-slate-50 p-10 flex items-center justify-center border-r">
                <img src={selectedProduct.imageUrl} className="max-w-full max-h-[400px] object-contain drop-shadow-2xl" alt={selectedProduct.name} />
              </div>
              <div className="md:w-1/2 p-10 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedProduct.name}</h2>
                  <button onClick={() => setSelectedProduct(null)} className="text-slate-300 hover:text-red-500 text-3xl font-black transition">×</button>
                </div>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">{selectedProduct.description}</p>
                
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="mb-10">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Select Size</label>
                    <div className="flex flex-wrap gap-3">
                       {selectedProduct.sizes.map(size => (
                         <button 
                           key={size}
                           onClick={() => setSelectedSize(size)}
                           className={`px-6 py-3 rounded-xl border-2 font-black transition ${selectedSize === size ? 'bg-[#131921] text-white border-[#131921]' : 'border-slate-100 text-slate-400 hover:border-[#febd69]'}`}
                         >
                           {size}
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-10 border-t flex items-center justify-between">
                  <div className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {selectedProduct.price.toLocaleString()}</div>
                  <button 
                    disabled={selectedProduct.sizes.length > 0 && !selectedSize}
                    onClick={() => addToCart(selectedProduct, selectedSize)}
                    className="bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-[#128C7E] transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Checkout Sidebar/Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end">
           <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              <header className="p-10 border-b flex justify-between items-center bg-slate-50">
                 <div>
                    <h2 className="text-3xl font-black tracking-tight">Your Cart</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Shopping at {seller?.shopName}</p>
                 </div>
                 <button onClick={() => setShowCheckout(false)} className="text-slate-300 hover:text-red-500 text-3xl font-black">×</button>
              </header>

              <div className="flex-1 overflow-auto p-10 space-y-6">
                 {cart.length === 0 ? (
                   <div className="text-center py-20 text-slate-300 font-black italic uppercase">Cart is empty</div>
                 ) : (
                   cart.map((item, idx) => (
                     <div key={idx} className="flex gap-4 items-center bg-slate-50 p-6 rounded-3xl border border-slate-100 relative group">
                        <img src={item.product.imageUrl} className="w-16 h-16 rounded-xl object-contain bg-white border" alt={item.product.name} />
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm">{item.product.name}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400 mt-1">
                            {item.size ? `Size: ${item.size}` : 'Standard'} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="font-black text-slate-900">Rs. {(item.product.price * item.quantity).toLocaleString()}</div>
                     </div>
                   ))
                 )}
              </div>

              {cart.length > 0 && (
                <div className="p-10 bg-white border-t space-y-8">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {total.toLocaleString()}</span>
                   </div>
                   <div className="space-y-4">
                      <input type="text" placeholder="Full Delivery Name" className="w-full p-5 rounded-2xl border-2 border-slate-100 font-bold focus:border-[#febd69] outline-none transition" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                      <input type="text" placeholder="WhatsApp Number (03XX...)" className="w-full p-5 rounded-2xl border-2 border-slate-100 font-bold focus:border-[#febd69] outline-none transition" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                      <textarea placeholder="Full Delivery Address" className="w-full p-5 rounded-2xl border-2 border-slate-100 font-bold h-24 focus:border-[#febd69] outline-none transition" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                   </div>
                   <button onClick={submitOrder} className="w-full py-6 bg-[#25D366] text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-[#128C7E] transition">Confirm Order</button>
                   <p className="text-[9px] text-center font-black text-slate-400 uppercase tracking-widest">Cash on Delivery • Free Verification</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
