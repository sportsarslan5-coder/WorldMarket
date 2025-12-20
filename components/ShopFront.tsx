
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seller, Product, Order, OrderStatus, PaymentMethod } from '../types.ts';

interface ShopFrontProps {
  sellers: Seller[];
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

// Admin WhatsApp number as requested: +92 307 9490 721
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
      (p.name?.toLowerCase().includes(shopSearch.toLowerCase()) || false)
    ) || [];
  }, [products, seller, shopSearch]);
  
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', address: '', method: PaymentMethod.COD });
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Crash prevention: If slug is active but seller data hasn't loaded
  if (!seller && slug) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] p-10 text-center font-sans">
      <div className="bg-white p-20 rounded-xl shadow-2xl max-w-lg">
        <h2 className="text-7xl font-black text-slate-900 mb-6">404</h2>
        <p className="text-slate-500 font-bold mb-10 text-xl leading-relaxed">Shop not found. Return home to discover more vendors.</p>
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
      alert("Required: Name, WhatsApp, and Address are needed to process your order.");
      return;
    }

    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      sellerId: seller?.id || '',
      sellerName: seller?.shopName || '',
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

    // Construct the review link that Admin can click on WhatsApp
    const baseAppUrl = window.location.href.split('#')[0];
    const reviewLink = `${baseAppUrl}#/admin/orders`;

    // Detailed WhatsApp Message for Admin
    const itemList = cart.map(c => `- ${c.product.name} x${c.quantity} (Rs. ${c.product.price})`).join('%0A');
    const message = `*URGENT: NEW CUSTOMER ORDER*%0A%0A` +
                    `*Order ID:* ${orderId}%0A` +
                    `*From Shop:* ${seller?.shopName}%0A%0A` +
                    `*Customer Details:*%0A` +
                    `- Name: ${customerInfo.name}%0A` +
                    `- WhatsApp: ${customerInfo.phone}%0A` +
                    `- Address: ${customerInfo.address}%0A%0A` +
                    `*Items Ordered:*%0A${itemList}%0A%0A` +
                    `*GTV:* Rs. ${total.toLocaleString()}%0A%0A` +
                    `*Action Required:* Verify logistics and disburse 5% share to vendor.%0A` +
                    `*Click to Review Website:* ${reviewLink}`;

    onPlaceOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);

    // Trigger WhatsApp notification to Admin
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10 animate-in fade-in zoom-in font-sans">
        <div className="max-w-2xl w-full text-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 text-4xl shadow-lg">✓</div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Order Received!</h2>
          <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">Your order for <b>{seller?.shopName}</b> has been sent to our Admin. We will reach out on WhatsApp to confirm delivery scheduling.</p>
          <Link to="/" className="bg-[#febd69] text-[#131921] px-12 py-5 rounded-md font-black text-lg shadow-xl">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-20 font-sans">
      <nav className="bg-[#232f3e] text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-6">
          <Link to="/" className="text-xl font-black text-white px-2">PK-MART</Link>
          <div className="flex-1 flex w-full">
            <div className="bg-[#f3f3f3] text-[#232f3e] px-4 rounded-l-md flex items-center font-black text-[10px]">
              {seller?.shopName?.toUpperCase()}
            </div>
            <input 
              type="text" 
              placeholder={`Search in ${seller?.shopName}...`} 
              className="flex-1 p-3 outline-none text-slate-900 font-bold"
              value={shopSearch}
              onChange={(e) => setShopSearch(e.target.value)}
            />
          </div>
          <div className="relative cursor-pointer" onClick={() => setShowCheckout(true)}>
             <span className="absolute -top-2 -right-2 bg-[#febd69] text-[#131921] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#232f3e]">{cart.length}</span>
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
        </div>
      </nav>

      <header className="bg-white border-b border-slate-200 p-12 text-center mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{seller?.shopName}</h1>
        <div className="flex justify-center items-center gap-6">
          <span className="text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full">Official Partner</span>
          <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verified PK-MART Vendor</span>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <main className="lg:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {shopProducts.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col group hover:shadow-xl transition-all">
                <div className="h-64 mb-6 flex items-center justify-center">
                  <img src={p.imageUrl} className="max-w-full max-h-full object-contain" alt={p.name} />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-6">{p.name}</h3>
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                  <div className="font-black text-2xl text-slate-900">Rs. {p.price?.toLocaleString()}</div>
                  <button onClick={() => addToCart(p)} className="bg-[#ffd814] text-[#131921] px-6 py-3 rounded-full text-xs font-black shadow-md">Add to Bag</button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="lg:col-span-3">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 sticky top-28">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Your Cart</h2>
            
            {cart.length === 0 ? (
              <p className="text-slate-400 font-black text-center py-10">Bag is empty</p>
            ) : (
              <div className="space-y-8">
                <div className="space-y-4 max-h-[40vh] overflow-auto">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 items-center border-b pb-4">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-xs">{item.product.name}</p>
                        <p className="text-slate-400 text-[10px]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-black text-slate-900 text-xs">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-6 pt-4 border-t">
                   <div className="flex justify-between font-black text-xl">
                     <span>Total:</span>
                     <span>Rs. {total.toLocaleString()}</span>
                   </div>
                   {!showCheckout ? (
                     <button onClick={() => setShowCheckout(true)} className="w-full py-5 rounded-md font-black bg-[#ffd814]">Checkout</button>
                   ) : (
                     <div className="space-y-4 animate-in fade-in">
                       <input type="text" placeholder="Full Name" className="w-full border p-4 rounded-md font-bold" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                       <input type="text" placeholder="WhatsApp Phone" className="w-full border p-4 rounded-md font-bold" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                       <textarea placeholder="Delivery Address" className="w-full border p-4 rounded-md font-bold h-24" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                       <button onClick={submitOrder} className="w-full bg-[#25D366] py-5 rounded-md font-black text-white shadow-xl">Place Order via WhatsApp</button>
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
