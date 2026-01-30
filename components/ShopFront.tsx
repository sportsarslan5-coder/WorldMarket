
import React, { useState, useEffect } from 'react';
// Fixing "no exported member" errors by using namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { Seller, Product } from '../types.ts';
import { api } from '../services/api.ts';

const { useParams, Link, useNavigate } = ReactRouterDOM as any;

const ShopFront: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const found = await api.fetchShopBySlug(slug);
      if (found) {
        setShop(found);
        const p = await api.fetchSellerProducts(found.id);
        setProducts(p);
      }
      setIsLoading(false);
    };
    load();
  }, [slug]);

  const initiateCheckout = async (product: Product) => {
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    await api.initOrder({
      id: orderId,
      shopId: shop?.id || '',
      shopName: shop?.name || '',
      sellerWhatsApp: shop?.phone || '',
      customerName: 'Guest User',
      customerEmail: 'guest@example.com',
      customerPhone: '000-000-0000',
      customerAddress: 'USA Shipping Address',
      items: [{ productId: product.id, productName: product.name, quantity: 1, price: product.price }],
      totalAmount: product.price,
      productPrice: product.price,
      paymentMethod: '2Checkout',
      currency: 'USD',
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    navigate(`/checkout-gateway/${orderId}`);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Storefront...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <nav className="p-8 h-20 flex items-center justify-between glass border-b border-slate-100 sticky top-0 z-[100]">
        <Link to="/" className="text-xl font-black italic tracking-tighter uppercase">AMZ<span className="text-blue-600">PRIME</span></Link>
        <div className="flex items-center gap-6">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:block">PCI-DSS COMPLIANT</span>
           <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
           </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-8 py-24">
        <header className="mb-24 space-y-6">
           <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">Official Prime Partner</p>
           <h1 className="text-6xl md:text-[120px] font-black tracking-tighter uppercase italic leading-[0.8] mb-8">{shop?.name}</h1>
           <div className="flex flex-wrap items-center gap-6">
              <div className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Verified Marketplace Node</div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">{products.length} Items Live</p>
           </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group flex flex-col animate-fade-in-up">
              <div 
                className="aspect-[4/5] flex items-center justify-center mb-8 bg-[#f9f9f9] rounded-[48px] p-10 overflow-hidden relative group-hover:bg-slate-50 transition duration-700 cursor-pointer"
                onClick={() => setSelectedProduct(p)}
              >
                <img src={p.imageUrl} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-1000 ease-in-out" alt={p.name} />
                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition duration-500">
                   <span className="bg-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm">Quick View</span>
                </div>
              </div>
              <div className="space-y-3 px-2">
                 <div className="flex justify-between items-start">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{p.category}</p>
                 </div>
                 <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-900 leading-none">{p.name}</h3>
                 <p className="text-3xl font-black text-slate-900 italic pt-2">${p.price.toLocaleString()}</p>
                 <div className="pt-6 flex gap-3">
                    <button onClick={() => initiateCheckout(p)} className="flex-1 h-16 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition shadow-xl active:scale-95">
                      Buy Now
                    </button>
                    <button onClick={() => setSelectedProduct(p)} className="w-16 h-16 bg-slate-100 text-slate-900 rounded-[24px] flex items-center justify-center hover:bg-slate-200 transition">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-[200] flex items-center justify-center p-6" onClick={() => setSelectedProduct(null)}>
           <div className="bg-white p-12 md:p-16 rounded-[64px] max-w-4xl w-full relative shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition text-2xl font-bold">✕</button>
              
              <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="w-full md:w-1/2 aspect-square bg-[#f9f9f9] rounded-[48px] flex items-center justify-center p-12 shadow-inner">
                  <img src={selectedProduct.imageUrl} className="max-h-full mix-blend-multiply" alt="" />
                </div>
                <div className="w-full md:w-1/2 space-y-8 text-left">
                  <div className="space-y-2">
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">{selectedProduct.category}</p>
                    <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-[0.9]">{selectedProduct.name}</h2>
                  </div>
                  <p className="text-slate-900 font-black text-5xl italic">${selectedProduct.price.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-wider">{selectedProduct.description}</p>
                  
                  <div className="pt-8 grid grid-cols-1 gap-4">
                     <button onClick={() => initiateCheckout(selectedProduct)} className="h-20 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">
                        Secure Checkout
                     </button>
                     <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Encrypted Verifone Gateway Enabled</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
