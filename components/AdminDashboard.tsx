
import React, { useState, useEffect } from 'react';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sellers' | 'orders' | 'products'>('sellers');
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = async () => {
      const [s, o, p] = await Promise.all([
        api.fetchAllShops(),
        api.fetchAllOrders(),
        api.fetchGlobalProducts()
      ]);
      setShops(s);
      setOrders(o);
      setProducts(p);
    };
    load();
    // Listen for storage changes from other tabs
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans">
      <nav className="w-full lg:w-80 bg-slate-900 p-10 text-white flex flex-col h-screen sticky top-0">
        <div className="text-2xl font-black italic mb-20">MASTER_GRID</div>
        <div className="space-y-4">
          <button onClick={() => setActiveTab('sellers')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest ${activeTab === 'sellers' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Sellers ({shops.length})</button>
          <button onClick={() => setActiveTab('products')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Global SKUs ({products.length})</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Order Log ({orders.length})</button>
        </div>
      </nav>

      <main className="flex-1 p-8 lg:p-20 overflow-y-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-12">{activeTab} Monitor</h1>

        {activeTab === 'sellers' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {shops.map(s => (
              <div key={s.id} className="bg-slate-900 border border-white/5 p-8 rounded-[40px] flex justify-between items-center text-white">
                <div>
                  <h3 className="text-xl font-black">{s.name}</h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase">{s.whatsappNumber}</p>
                </div>
                <div className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full">ACTIVE</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-slate-900 border border-white/5 p-6 rounded-[30px] text-white">
                <img src={p.imageUrl} className="h-32 w-full object-contain mb-4 bg-white/5 rounded-xl p-4" />
                <h4 className="font-black truncate">{p.name}</h4>
                <p className="text-blue-500 font-black">Rs. {p.price.toLocaleString()}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase mt-2">By: {p.sellerName}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-slate-900 border border-white/5 p-8 rounded-[40px] flex items-center justify-between text-white cursor-pointer hover:border-blue-600 transition group">
                <div>
                  <h3 className="text-lg font-black group-hover:text-blue-600">Order #{o.id}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase">{o.customerName} @ {o.shopName}</p>
                </div>
                <p className="text-2xl font-black italic">Rs. {o.totalAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[500] flex items-center justify-center p-6" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white p-12 md:p-16 rounded-[60px] max-w-2xl w-full animate-slide-up" onClick={e => e.stopPropagation()}>
              <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">Order Snapshot</h2>
              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Customer</p>
                       <p className="font-black text-xl">{selectedOrder.customerName}</p>
                       <p className="font-bold text-slate-600">{selectedOrder.customerPhone}</p>
                       <p className="text-slate-500 mt-2 text-sm">{selectedOrder.customerAddress}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Vendor Node</p>
                       <p className="font-black text-xl">{selectedOrder.shopName}</p>
                       <p className="font-bold text-blue-600">{selectedOrder.sellerWhatsApp}</p>
                    </div>
                 </div>
                 <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-black uppercase text-xs">Total Amount</span>
                    <span className="text-4xl font-black italic">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
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
