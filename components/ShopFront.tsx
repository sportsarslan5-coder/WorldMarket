
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';
import { ShareIcon, GlobeAltIcon } from './IconComponents.tsx';

const ShopFront: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '', size: '', color: '', quantity: 1 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadShop = async () => {
      if (!slug) return;
      const found = await api.fetchShopBySlug(slug);
      if (found) {
        setShop(found);
        const p = await api.fetchProductsBySeller(found.id);
        setProducts(p);
      }
      setIsLoading(false);
    };
    loadShop();
  }, [slug]);

  const handleOrder = async () => {
    if (!shop || !selectedProduct || !orderForm.name || !orderForm.phone || !orderForm.address) {
      alert("Please fill all required shipping fields.");
      return;
    }

    setIsSyncing(true);
    const orderId = 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const order: Order = {
      id: orderId,
      shopId: shop.id,
      shopName: shop.name,
      sellerWhatsApp: shop.whatsappNumber,
      customerName: orderForm.name,
      customerPhone: orderForm.phone,
      customerEmail: '',
      customerAddress: orderForm.address,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImageUrl: selectedProduct.imageUrl,
        quantity: orderForm.quantity,
        price: selectedProduct.price,
        size: orderForm.size,
        color: orderForm.color
      }],
      totalAmount: selectedProduct.price * orderForm.quantity,
      paymentStatus: 'unpaid',
      paymentMethod: 'COD',
      currency: 'PKR',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await api.saveOrder(order);
    alert(`Order ${orderId} successfully synced!`);
    setSelectedProduct(null);
    setIsSyncing(false);
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">SYNCING GLOBAL NODE...</div>;

  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black mb-4">404 NODE NOT FOUND</h1>
      <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase">Back to Market</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="glass sticky top-0 z-[100] border-b border-slate-100 px-6 py-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black italic">PK MART</Link>
        <button className="bg-slate-50 p-3 rounded-2xl"><ShareIcon /></button>
      </nav>

      <header className="bg-slate-900 text-white py-32 px-6 text-center relative overflow-hidden">
        <GlobeAltIcon className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-6">{shop.name}</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">{shop.description}</p>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p.id} className="group bg-white rounded-[50px] border border-slate-100 p-5 transition hover:shadow-2xl">
              <div className="aspect-square bg-slate-50 rounded-[40px] flex items-center justify-center p-10 overflow-hidden relative">
                <img src={p.imageUrl} className="h-full w-full object-contain group-hover:scale-110 transition duration-700" alt="p" />
                <button 
                  onClick={() => setSelectedProduct(p)}
                  className="absolute bottom-6 left-6 right-6 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest translate-y-20 group-hover:translate-y-0 transition shadow-xl"
                >
                  Order SKU Now
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-black text-xl mb-4 text-slate-900">{p.name}</h3>
                <p className="text-3xl font-black tracking-tighter">Rs. {p.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl p-10 md:p-16 rounded-[60px] animate-slide-up relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-10 right-10 font-black text-xl">✕</button>
            <div className="flex gap-8 mb-12 items-center">
              <img src={selectedProduct.imageUrl} className="w-24 h-24 object-contain bg-slate-50 p-4 rounded-3xl" />
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedProduct.name}</h2>
                <p className="text-2xl font-black text-blue-600">Rs. {selectedProduct.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-4">
              <input placeholder="Full Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
              <input placeholder="Phone Number" className="w-full p-5 bg-slate-50 rounded-2xl font-bold" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
              <textarea placeholder="Delivery Address" className="w-full p-5 bg-slate-50 rounded-2xl font-bold h-32" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} />
              <button onClick={handleOrder} disabled={isSyncing} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl uppercase tracking-widest mt-6">
                {isSyncing ? 'SYNCING ORDER...' : 'CONFIRM GLOBAL ORDER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFront;
