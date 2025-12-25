
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const ShopFront: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  
  const [custForm, setCustForm] = useState({ name: '', phone: '', address: '' });

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

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !selectedProduct) return;
    setIsOrdering(true);

    const order: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      shopId: shop.id,
      shopName: shop.name,
      sellerWhatsApp: shop.whatsappNumber,
      customerName: custForm.name,
      customerPhone: custForm.phone,
      customerEmail: '',
      customerAddress: custForm.address,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImageUrl: selectedProduct.imageUrl,
        quantity: 1,
        price: selectedProduct.price
      }],
      totalAmount: selectedProduct.price,
      paymentStatus: 'unpaid',
      paymentMethod: 'COD',
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await api.placeOrder(order);
    alert("ORDER SYNCED! Redirecting to WhatsApp for confirmation...");
    setSelectedProduct(null);
    setIsOrdering(false);
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black">SYNCING SHOP NODE...</div>;

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
      <h1 className="text-4xl font-black mb-4">404: NODE NOT FOUND</h1>
      <Link to="/" className="text-blue-600 font-bold underline">Return to Global Grid</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="bg-slate-900 text-white py-24 px-6 text-center border-b-4 border-blue-600">
        <h1 className="text-7xl font-black uppercase tracking-tighter italic">{shop.name}</h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-4">Verified Global Partner • {shop.id}</p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="flex flex-col">
              <div className="aspect-square bg-slate-50 rounded-[40px] flex items-center justify-center p-10 mb-6 group overflow-hidden">
                <img src={p.imageUrl} className="h-full w-full object-contain group-hover:scale-110 transition duration-500" />
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-2">{p.name}</h3>
              <p className="text-3xl font-black tracking-tighter mb-6">Rs. {p.price.toLocaleString()}</p>
              <button 
                onClick={() => setSelectedProduct(p)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition"
              >
                Order Now
              </button>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[50px] max-w-xl w-full animate-slide-up relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 font-black">✕</button>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Secure Checkout</h2>
            <p className="text-slate-400 font-bold text-xs uppercase mb-8">Item: {selectedProduct.name} (Rs. {selectedProduct.price})</p>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <input required placeholder="Full Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} />
              <input required placeholder="Phone Number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none" value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} />
              <textarea required placeholder="Delivery Address" className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none h-32" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
              <button disabled={isOrdering} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-emerald-500/20">
                {isOrdering ? 'SYNCING ORDER...' : 'PLACE ORDER VIA WHATSAPP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
