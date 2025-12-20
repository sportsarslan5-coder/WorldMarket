
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';

interface ShopFrontProps {
  sellers: Seller[];
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

const ShopFront: React.FC<ShopFrontProps> = ({ sellers, products, onPlaceOrder }) => {
  const { slug } = useParams();
  const seller = sellers.find(s => s.shopSlug === slug);
  const shopProducts = products.filter(p => p.sellerId === seller?.id && p.published);
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    method: PaymentMethod.COD 
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!seller) return <div className="p-20 text-center text-xl font-black text-slate-800">Shop Not Found</div>;

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
      alert("Please fill in your contact details.");
      return;
    }

    const newOrder: Order = {
      id: 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      sellerId: seller.id,
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

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Order Placed!</h2>
          <p className="text-gray-500 mb-10 font-medium text-lg">Thank you! Your order for {seller.shopName} has been received. Admin will contact you for delivery.</p>
          <button onClick={() => setOrderPlaced(false)} className="bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-green-700 shadow-xl transition w-full">Back to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-green-600 text-white px-6 py-12 text-center shadow-md">
        <h1 className="text-5xl font-black tracking-tighter mb-2">{seller.shopName}</h1>
        <p className="text-green-100 font-bold uppercase text-[10px] tracking-widest">Authorized Shop on PK-Mart</p>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-10">
          {shopProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-500 group flex flex-col">
              <div className="h-64 overflow-hidden relative">
                <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={product.name} />
                <div className="absolute top-4 right-4 bg-white/95 px-4 py-2 rounded-full font-black text-green-600 shadow-sm">
                  Rs. {product.price}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black mb-2 text-slate-900 tracking-tight">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-3">{product.description}</p>
                <div className="mt-auto">
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-green-600 shadow-lg transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-4">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 p-8 sticky top-28">
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center justify-between">
              <span>Cart</span>
              <span className="bg-slate-50 text-slate-400 text-xs px-3 py-1 rounded-full">{cart.length}</span>
            </h2>
            
            {cart.length === 0 ? (
              <p className="py-10 text-center text-gray-400 font-bold uppercase text-[10px]">Your cart is empty</p>
            ) : (
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <img src={item.product.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-black text-slate-800 text-sm">{item.product.name}</p>
                      <p className="text-gray-400 text-[10px] font-bold">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-black text-slate-900 text-sm">Rs.{item.product.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            )}
            
            {cart.length > 0 && (
              <div className="border-t pt-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-xl text-slate-900">Total</span>
                  <span className="font-black text-3xl text-green-600">Rs. {total}</span>
                </div>
              </div>
            )}

            {!showCheckout ? (
              <button 
                disabled={cart.length === 0}
                onClick={() => setShowCheckout(true)}
                className={`w-full py-5 rounded-2xl font-black text-white shadow-xl ${cart.length === 0 ? 'bg-slate-200 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                Checkout Now
              </button>
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Full Name" className="w-full border p-4 rounded-xl font-bold text-sm" 
                  value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
                <input 
                  type="text" placeholder="Phone Number" className="w-full border p-4 rounded-xl font-bold text-sm" 
                  value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
                <textarea 
                  placeholder="Complete Delivery Address" className="w-full border p-4 rounded-xl font-bold text-sm h-24" 
                  value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                />
                <div className="bg-slate-50 p-4 rounded-xl">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Payment Method</label>
                  <select 
                    className="w-full bg-transparent font-black text-sm outline-none"
                    value={customerInfo.method} onChange={e => setCustomerInfo({...customerInfo, method: e.target.value as PaymentMethod})}
                  >
                    <option value={PaymentMethod.COD}>Cash on Delivery</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer (Admin Account)</option>
                  </select>
                </div>
                <button 
                  onClick={submitOrder}
                  className="w-full bg-green-600 py-5 rounded-2xl font-black text-white shadow-2xl hover:bg-green-700 transition"
                >
                  Confirm Order
                </button>
                <button onClick={() => setShowCheckout(false)} className="w-full text-xs font-black text-gray-400 py-2">Edit Cart</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopFront;
