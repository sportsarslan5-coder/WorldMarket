
import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';

interface ShopFrontProps {
  sellers: Seller[];
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

const ShopFront: React.FC<ShopFrontProps> = ({ sellers = [], products = [], onPlaceOrder }) => {
  const { slug } = useParams();
  
  const seller = useMemo(() => sellers.find(s => s.shopSlug === slug), [sellers, slug]);
  const shopProducts = useMemo(() => products.filter(p => p.sellerId === seller?.id && p.published), [products, seller]);
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', address: '', method: PaymentMethod.COD });
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-sm">
        <h2 className="text-4xl font-black text-slate-900 mb-4">404</h2>
        <p className="text-slate-500 font-medium">Shop not found. Please check the URL.</p>
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
      alert("Please provide contact and delivery details.");
      return;
    }

    const newOrder: Order = {
      id: 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
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
      commissionAmount: total * 0.05, // 5% for the seller
      createdAt: new Date().toISOString()
    };

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6 animate-in fade-in zoom-in">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl">✓</div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Order Received!</h2>
          <p className="text-slate-500 mb-10 font-medium text-lg leading-relaxed">Admin will verify your details and process shipment. Thank you for shopping with <b>{seller.shopName}</b>.</p>
          <button onClick={() => setOrderPlaced(false)} className="bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-green-700 shadow-xl transition-all w-full">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="bg-slate-900 text-white px-6 py-16 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-2 animate-in slide-in-from-top duration-500">{seller.shopName}</h1>
        <p className="text-green-500 font-bold uppercase text-[10px] tracking-widest">Verified Vendor @ PK-MART</p>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {shopProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition duration-500 group flex flex-col">
              <div className="h-72 overflow-hidden relative">
                <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={product.name} />
                <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur px-5 py-2 rounded-full font-black text-white shadow-sm text-sm">
                  Rs. {product.price.toLocaleString()}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black mb-3 text-slate-900 leading-tight">{product.name}</h3>
                <p className="text-slate-400 text-sm mb-8 line-clamp-3 font-medium leading-relaxed">{product.description}</p>
                <button 
                  onClick={() => addToCart(product)}
                  className="mt-auto w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-green-600 shadow-lg transition-all transform active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 p-8 sticky top-10">
            <h2 className="text-2xl font-black mb-8 text-slate-900 flex items-center justify-between">
              <span>Checkout</span>
              <span className="bg-green-100 text-green-700 text-xs px-4 py-1.5 rounded-full font-black uppercase tracking-widest">{cart.length} Items</span>
            </h2>
            
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="text-slate-300 font-black text-6xl">🛒</p>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Select products to begin</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4 max-h-[30vh] overflow-auto pr-2 scrollbar-hide">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <img src={item.product.imageUrl} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm">{item.product.name}</p>
                        <p className="text-slate-400 text-[10px] font-bold">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-black text-slate-900 text-sm">Rs.{ (item.product.price * item.quantity).toLocaleString() }</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-6">
                   <div className="flex justify-between items-center mb-8">
                     <span className="font-black text-xl text-slate-400">Total Due</span>
                     <span className="font-black text-3xl text-slate-900">Rs. {total.toLocaleString()}</span>
                   </div>

                   {!showCheckout ? (
                     <button onClick={() => setShowCheckout(true)} className="w-full py-5 rounded-2xl font-black text-white bg-green-600 shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all">Proceed to Checkout</button>
                   ) : (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                       <input 
                         type="text" placeholder="Full Name" className="w-full border-slate-100 bg-slate-50 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-green-500 border transition-all" 
                         value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                       />
                       <input 
                         type="text" placeholder="WhatsApp Number" className="w-full border-slate-100 bg-slate-50 p-4 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-green-500 border transition-all" 
                         value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                       />
                       <textarea 
                         placeholder="Full Address (Lahore, Karachi, etc.)" className="w-full border-slate-100 bg-slate-50 p-4 rounded-xl font-bold text-sm h-24 outline-none focus:ring-2 focus:ring-green-500 border transition-all" 
                         value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                       />
                       <div className="bg-slate-900 p-4 rounded-2xl text-white">
                         <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Payment</label>
                         <select 
                           className="w-full bg-transparent font-black text-sm outline-none cursor-pointer"
                           value={customerInfo.method} onChange={e => setCustomerInfo({...customerInfo, method: e.target.value as PaymentMethod})}
                         >
                           <option value={PaymentMethod.COD}>Cash on Delivery</option>
                           <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer (Admin)</option>
                         </select>
                       </div>
                       <button 
                         onClick={submitOrder}
                         className="w-full bg-green-600 py-5 rounded-2xl font-black text-white shadow-2xl hover:bg-green-700 transition"
                       >
                         Place Order
                       </button>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopFront;
