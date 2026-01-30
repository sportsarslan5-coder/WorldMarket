
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { api } from '../services/api.ts';
import { Product, Seller } from '../types.ts';

const { useParams } = ReactRouterDOM as any;

const SellerStorefront: React.FC = () => {
  const { slug } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  useEffect(() => {
    const loadStore = async () => {
      const foundSeller = await api.findSellerBySlug(slug);
      if (foundSeller) {
        setSeller(foundSeller);
        // Renamed getAdminProducts to getAllProducts
        const allProducts = await api.getAllProducts();
        setProducts(allProducts);
      }
      setLoading(false);
    };
    loadStore();
  }, [slug]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct || !seller) return;

    await api.placeOrder({
      productId: checkoutProduct.id,
      productName: checkoutProduct.name,
      productPrice: checkoutProduct.price,
      sellerId: seller.id,
      sellerName: seller.name,
      sellerSlug: seller.slug,
      customerName: customer.name,
      customerWhatsapp: customer.phone, // Fixed: customerPhone -> customerWhatsapp
      customerLocation: customer.address, // Fixed: customerAddress -> customerLocation
      customerEmail: customer.email
    });

    alert("Order Placed Successfully! Redirecting to Admin WhatsApp...");
    setCheckoutProduct(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">SYNCING STOREFRONT...</div>;
  if (!seller) return <div className="min-h-screen flex items-center justify-center font-black text-red-500 uppercase">404 | STORE NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      <header className="max-w-7xl mx-auto mb-16 flex justify-between items-end border-b-4 border-slate-900 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">{seller.name} <span className="text-blue-600">STORE</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized AMZ PRIME Distributor</p>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Protocol</p>
           <p className="text-sm font-bold">NODE: {seller.id}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-white border-2 border-slate-900 rounded-[32px] overflow-hidden flex flex-col hover:shadow-2xl transition-all">
            <div className="aspect-square bg-slate-100 flex items-center justify-center p-8 border-b-2 border-slate-900">
               <img src={p.imageUrl} alt={p.name} className="max-h-full mix-blend-multiply" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] mb-2">{p.category}</p>
              <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-4">{p.name}</h3>
              <p className="text-3xl font-black text-slate-900 mb-8 italic">${p.price.toLocaleString()}</p>
              <button 
                onClick={() => setCheckoutProduct(p)}
                className="mt-auto w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-lg active:scale-95"
              >
                Order Now
              </button>
            </div>
          </div>
        ))}
      </main>

      {checkoutProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[40px] max-w-lg w-full shadow-2xl animate-fade-in relative border-4 border-slate-900">
             <button onClick={() => setCheckoutProduct(null)} className="absolute top-8 right-8 text-2xl font-black">✕</button>
             <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Checkout</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Confirming your order for {checkoutProduct.name}</p>
             
             <form onSubmit={handleCheckout} className="space-y-4">
                <input required placeholder="Your Full Name" className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-900 rounded-2xl outline-none font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                <input required placeholder="Shipping Address" className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-900 rounded-2xl outline-none font-bold" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="tel" placeholder="Phone Number" className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-900 rounded-2xl outline-none font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                  <input required type="email" placeholder="Email Address" className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-900 rounded-2xl outline-none font-bold" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
                </div>
                <div className="pt-6 border-t-2 border-slate-100 mt-6">
                   <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Price</span>
                      <span className="text-3xl font-black italic">${checkoutProduct.price}</span>
                   </div>
                   <button className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition active:scale-95">
                      Confirm & Send via WhatsApp
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerStorefront;
