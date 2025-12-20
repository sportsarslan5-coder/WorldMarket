
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
    <div className="min-h-screen flex items-center justify-center font-sans">
      <div className="text-center">
        <h2 className="text-4xl font-black mb-4">404 - Shop Not Found</h2>
        <Link to="/" className="text-blue-600 font-bold hover:underline">Return to Marketplace</Link>
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
      alert("Please provide your delivery details.");
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

    // Deep link for Admin to see the order panel
    const adminLink = `${window.location.origin}/#/admin/orders`;

    // WhatsApp Message for Admin
    const itemList = cart.map(c => `- ${c.product.name} (x${c.quantity})`).join('%0A');
    const message = `*VEO-PK ADMIN: NEW ORDER*%0A` +
                    `--------------------------%0A` +
                    `*ID:* ${orderId}%0A` +
                    `*Store:* ${seller?.shopName}%0A` +
                    `*Customer:* ${customerInfo.name}%0A` +
                    `*Phone:* ${customerInfo.phone}%0A` +
                    `*Address:* ${customerInfo.address}%0A%0A` +
                    `*Items:*%0A${itemList}%0A%0A` +
                    `*Total:* Rs. ${total.toLocaleString()}%0A%0A` +
                    `*View Order:* ${adminLink}`;

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans p-6 text-center bg-white">
        <div className="max-w-xl">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-4xl font-black mb-4">Order Received!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">The Admin has been notified via WhatsApp. We will reach out to you shortly to confirm the delivery for {seller?.shopName}.</p>
          <Link to="/" className="bg-[#febd69] px-10 py-4 rounded-lg font-black text-lg">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-[#232f3e] text-white p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-black">PK-MART | {seller?.shopName}</Link>
          <div className="relative cursor-pointer" onClick={() => setShowCheckout(true)}>
             <span className="absolute -top-2 -right-2 bg-[#febd69] text-[#131921] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>
             🛒
          </div>
        </div>
      </nav>

      <header className="bg-white p-16 text-center shadow-sm border-b">
        <h1 className="text-5xl font-black text-slate-900 mb-2">{seller?.shopName}</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Official Multi-Vendor Partner</p>
      </header>

      <main className="max-w-6xl mx-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shopProducts.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border group">
            <div className="h-64 bg-slate-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
               <img src={p.imageUrl} className="max-h-full group-hover:scale-110 transition duration-500" alt={p.name} />
            </div>
            <h3 className="font-bold text-lg mb-2">{p.name}</h3>
            <div className="flex justify-between items-center mt-6">
               <div className="text-2xl font-black">Rs. {p.price.toLocaleString()}</div>
               <button onClick={() => addToCart(p)} className="bg-[#ffd814] px-5 py-2 rounded-full text-xs font-black">Add to Bag</button>
            </div>
          </div>
        ))}
      </main>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-2xl p-10 max-h-[90vh] overflow-auto animate-in slide-in-from-bottom">
              <h2 className="text-3xl font-black mb-8">Checkout</h2>
              
              {cart.length === 0 ? (
                <p className="text-center py-10 font-bold text-slate-400">Your bag is empty.</p>
              ) : (
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between border-b pb-4">
                      <div>
                        <p className="font-bold text-sm">{item.product.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-black text-slate-900">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="text-2xl font-black pt-4 flex justify-between">
                    <span>Total:</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-4 pt-6">
                    <input type="text" placeholder="Full Name" className="w-full p-4 rounded-lg border font-bold" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    <input type="text" placeholder="WhatsApp Phone" className="w-full p-4 rounded-lg border font-bold" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                    <textarea placeholder="Full Address" className="w-full p-4 rounded-lg border font-bold h-24" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                    <p className="text-[10px] font-black text-orange-600 uppercase">Payment: Cash on Delivery Only</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-10">
                <button onClick={() => setShowCheckout(false)} className="flex-1 py-4 bg-slate-100 rounded-lg font-black">Back</button>
                <button onClick={submitOrder} className="flex-1 py-4 bg-[#25D366] text-white rounded-lg font-black shadow-lg">Confirm via WhatsApp</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
