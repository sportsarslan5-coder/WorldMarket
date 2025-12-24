
import React, { useState, useEffect } from 'react';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const MASTER_PIN = "PK-MART-9988";

const AdminDashboard: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'shops' | 'orders' | 'products'>('shops');
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isAuth) loadData();
  }, [isAuth]);

  const loadData = async () => {
    const [s, o, p] = await Promise.all([api.fetchAllShops(), api.fetchAllOrders(), api.fetchAllProducts()]);
    setShops(s);
    setOrders(o);
    setProducts(p);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if(pin === MASTER_PIN) setIsAuth(true); else alert("Wrong Pin"); }} className="bg-slate-900 p-16 rounded-[60px] max-w-lg w-full text-center border border-white/5">
          <h2 className="text-white text-3xl font-black mb-8 uppercase tracking-widest">Master Auth</h2>
          <input type="password" placeholder="PIN" className="w-full p-6 bg-black rounded-3xl text-white text-4xl text-center font-black outline-none border-2 border-transparent focus:border-blue-600 transition" value={pin} onChange={e => setPin(e.target.value)} />
          <button className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-lg mt-8">UNLOCK CONSOLE</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <nav className="w-full lg:w-80 bg-slate-900 p-10 text-white flex flex-col h-screen sticky top-0">
        <div className="text-2xl font-black mb-20 italic">PK_MASTER</div>
        <div className="space-y-4 flex-1">
          <button onClick={() => setActiveTab('shops')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest ${activeTab === 'shops' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Sellers</button>
          <button onClick={() => setActiveTab('products')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Products</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Orders</button>
        </div>
      </nav>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter">{activeTab} Grid</h2>

        {activeTab === 'shops' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {shops.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black">{s.name}</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase">{s.whatsappNumber}</p>
                </div>
                <div className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-4 py-2 rounded-full">Active Node</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[30px] border border-slate-100">
                <img src={p.imageUrl} className="h-32 w-full object-contain mb-4" />
                <h4 className="font-black text-slate-900">{p.name}</h4>
                <p className="text-blue-600 font-black">Rs. {p.price.toLocaleString()}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase mt-2">By: {p.sellerName}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-600 transition group">
                <div>
                  <h3 className="text-lg font-black group-hover:text-blue-600">Order #{o.id}</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase">{o.customerName} @ {o.shopName}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl">Rs. {o.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[300] flex items-center justify-center p-6" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white p-12 md:p-16 rounded-[60px] max-w-3xl w-full animate-slide-up relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 font-black">✕</button>
              <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">Order Snapshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Customer</p>
                    <p className="font-black text-xl">{selectedOrder.customerName}</p>
                    <p className="font-bold text-slate-600">{selectedOrder.customerPhone}</p>
                    <p className="text-slate-500 text-sm mt-4">{selectedOrder.customerAddress}</p>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-3xl text-white">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Vendor Node</p>
                    <p className="font-black text-xl">{selectedOrder.shopName}</p>
                    <p className="text-blue-400 font-bold">{selectedOrder.sellerWhatsApp}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-4">Cart Contents</p>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center mb-4 p-4 bg-slate-50 rounded-2xl">
                      <img src={item.productImageUrl} className="w-12 h-12 object-contain" />
                      <div>
                        <p className="font-black text-sm">{item.productName}</p>
                        <p className="text-blue-600 font-black">Rs. {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 border-t mt-6 flex justify-between">
                    <span className="font-black uppercase text-xs">Total Payload</span>
                    <span className="font-black text-2xl tracking-tighter">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
