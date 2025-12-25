
import React, { useState, useEffect } from 'react';
import { Shop, Product, Order } from '../types.ts';
import { api } from '../services/api.ts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sellers' | 'orders' | 'products'>('sellers');
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadData = async () => {
    const [s, o, p] = await Promise.all([
      api.fetchAllShops(),
      api.fetchAllOrders(),
      api.fetchGlobalProducts()
    ]);
    setShops(s);
    setOrders(o);
    setProducts(p);
  };

  useEffect(() => {
    loadData();
    // Real-time local sync simulation
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans">
      <nav className="w-full lg:w-80 bg-slate-900 p-10 text-white flex flex-col h-screen sticky top-0">
        <div className="text-2xl font-black italic mb-20 tracking-tighter">MASTER_GRID</div>
        <div className="space-y-4">
          <button onClick={() => setActiveTab('sellers')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'sellers' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Sellers ({shops.length})</button>
          <button onClick={() => setActiveTab('products')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Global SKUs ({products.length})</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-white/5'}`}>Order Log ({orders.length})</button>
        </div>
        <div className="mt-auto pt-10 border-t border-white/5">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Admin V2.0</p>
        </div>
      </nav>

      <main className="flex-1 p-8 lg:p-20 overflow-y-auto">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-12">{activeTab} Monitor</h1>

        {activeTab === 'sellers' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {shops.length === 0 ? (
               <div className="col-span-full py-40 text-center border-2 border-dashed border-white/10 rounded-[60px] text-slate-600 font-black uppercase">No sellers connected to node</div>
            ) : shops.map(s => (
              <div key={s.id} className="bg-slate-900 border border-white/5 p-10 rounded-[45px] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">{s.name}</h3>
                  <div className="space-y-1">
                    <p className="text-blue-500 font-bold text-sm uppercase tracking-widest">WA: {s.whatsappNumber}</p>
                    <p className="text-slate-500 font-bold text-[11px] uppercase">{s.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <div className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/20 uppercase">ACTIVE_NODE</div>
                  <a href={`/#/shop/${s.slug}`} target="_blank" className="text-[10px] font-black text-slate-400 hover:text-white underline uppercase">View Public Hub</a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map(p => (
              <div key={p.id} className="bg-slate-900 border border-white/5 p-6 rounded-[35px] text-white group hover:border-blue-500/50 transition">
                <img src={p.imageUrl} className="h-40 w-full object-contain mb-4 bg-white/5 rounded-2xl p-6" />
                <h4 className="font-black truncate text-lg mb-1">{p.name}</h4>
                <p className="text-blue-500 font-black text-xl">Rs. {p.price.toLocaleString()}</p>
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                   <p className="text-[9px] font-black text-slate-600 uppercase">Vendor: {p.sellerName}</p>
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
               <div className="py-40 text-center border-2 border-dashed border-white/10 rounded-[60px] text-slate-600 font-black uppercase">Grid clear - no pending orders</div>
            ) : orders.map(o => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-slate-900 border border-white/5 p-10 rounded-[45px] flex items-center justify-between text-white cursor-pointer hover:border-blue-600 transition group">
                <div>
                  <h3 className="text-xl font-black group-hover:text-blue-600 transition tracking-tight">Order #{o.id}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{o.customerName} @ {o.shopName}</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black italic text-white">Rs. {o.totalAmount.toLocaleString()}</p>
                   <span className="text-[9px] font-black uppercase text-blue-500">Logistics Pending</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-6" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white p-12 md:p-16 rounded-[60px] max-w-2xl w-full animate-slide-up relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center bg-slate-50 rounded-full font-black text-xl hover:bg-slate-100">✕</button>
              <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter text-slate-900">Order Detail</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest border-b pb-2">Customer Payload</p>
                    <div className="space-y-1">
                       <p className="font-black text-2xl text-slate-900">{selectedOrder.customerName}</p>
                       <p className="font-bold text-blue-600 text-lg">{selectedOrder.customerPhone}</p>
                       <p className="text-slate-500 mt-4 leading-relaxed font-medium">{selectedOrder.customerAddress}</p>
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest border-b pb-2">Logistics Route</p>
                    <div className="space-y-1">
                       <p className="font-black text-2xl text-slate-900">{selectedOrder.shopName}</p>
                       <p className="font-bold text-emerald-600 text-lg">{selectedOrder.sellerWhatsApp}</p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Billable</p>
                       <p className="text-4xl font-black italic text-slate-900">Rs. {selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
              
              <div className="mt-12 bg-slate-900 p-8 rounded-[35px] text-white">
                 <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Order Items</p>
                 {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                       <span className="font-bold">{it.productName} x{it.quantity}</span>
                       <span className="font-black">Rs. {it.price.toLocaleString()}</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
