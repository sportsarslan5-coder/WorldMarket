
import React, { useState, useEffect } from 'react';
import { Shop, ShopStatus, Order, AdminNotification } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.ts';

const MASTER_PIN = "PK-MART-9988";

const AdminDashboard: React.FC<{notifications: AdminNotification[], onRefresh: () => void}> = ({ notifications, onRefresh }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'shops' | 'orders' | 'activation'>('shops');
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastGeneratedKey, setLastGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isAuth) loadGlobalNode();
  }, [isAuth]);

  const loadGlobalNode = async () => {
    const [sh, ord] = await Promise.all([api.fetchAllShops(), api.fetchAllOrders()]);
    setShops(sh);
    setOrders(ord);
  };

  const createActivationKey = async () => {
    const key = await api.generateActivationKey();
    setLastGeneratedKey(key);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MASTER_PIN) setIsAuth(true);
    else alert("Invalid Command Center Pin.");
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={handleAuth} className="bg-slate-900 p-12 md:p-16 rounded-[60px] w-full max-w-lg text-center border border-white/5 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg shadow-blue-500/20">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 className="text-white text-3xl font-black uppercase tracking-widest mb-4">Command Center</h1>
          <p className="text-slate-500 font-bold mb-10 text-xs uppercase tracking-widest">Enter authentication protocol</p>
          <input 
            type="password" 
            placeholder="PIN" 
            className="w-full p-6 bg-black rounded-2xl text-white font-black text-4xl text-center outline-none border-2 border-transparent focus:border-blue-600 transition" 
            value={pin} onChange={e => setPin(e.target.value)} 
          />
          <button className="w-full bg-blue-600 py-6 rounded-3xl font-black text-lg mt-8 text-white hover:bg-blue-700 transition">UNLOCK HUB</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      <nav className="w-full lg:w-80 bg-slate-900 text-white p-10 flex flex-col sticky top-0 h-screen">
         <div className="text-2xl font-black italic tracking-tighter mb-20 flex items-center gap-3">
            <div className="bg-blue-600 w-8 h-8 rounded-lg"></div> PK_MASTER
         </div>
         <div className="space-y-4 flex-1">
            <button onClick={() => setActiveTab('shops')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'shops' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>Vendor Grid</button>
            <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>Order Stream</button>
            <button onClick={() => setActiveTab('activation')} className={`w-full text-left p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition ${activeTab === 'activation' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>Activation Keys</button>
         </div>
         <button onClick={() => window.location.reload()} className="mt-auto py-4 text-xs font-black text-slate-500 hover:text-white transition">LOGOUT NODE</button>
      </nav>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
         <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{activeTab} View</h2>
            <button onClick={loadGlobalNode} className="bg-white border border-slate-200 text-slate-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition">Refresh Network</button>
         </div>

         {activeTab === 'shops' && (
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {shops.map(s => (
                <div key={s.id} className="bg-white p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center border border-slate-100 hover:border-blue-200 transition">
                   <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-black tracking-tight text-slate-900">{s.name}</h3>
                        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${s.status === ShopStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{s.status}</span>
                      </div>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cat: {s.category} | Slug: /{s.slug}</p>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={async () => {
                           const n = s.status === ShopStatus.ACTIVE ? ShopStatus.SUSPENDED : ShopStatus.ACTIVE;
                           await api.updateShopStatus(s.id, n);
                           loadGlobalNode();
                        }}
                        className={`px-6 py-3 rounded-2xl font-black text-[9px] uppercase transition ${s.status === ShopStatus.ACTIVE ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                      >
                         {s.status === ShopStatus.ACTIVE ? 'Suspend' : 'Unsuspend'}
                      </button>
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'orders' && (
           <div className="space-y-4">
              {orders.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-black uppercase text-xs">No orders detected in grid</p>
                 </div>
              ) : orders.map(o => (
                <div 
                  key={o.id} 
                  onClick={() => setSelectedOrder(o)}
                  className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center cursor-pointer group hover:border-blue-500 transition"
                >
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-3">
                      <img src={o.items[0].productImageUrl} className="max-h-full object-contain" alt="p" />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-lg font-black tracking-tight group-hover:text-blue-600">Order {o.id}</h3>
                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">{o.customerName} @ {o.shopName}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-slate-900">Rs. {o.totalAmount.toLocaleString()}</p>
                      <span className="text-[9px] font-black text-blue-500 uppercase">{o.status}</span>
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'activation' && (
            <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-[60px] border border-slate-200 shadow-sm">
               <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Global Activation Protocol</h3>
               <p className="text-slate-400 font-bold text-sm mb-12 px-20">Generate unique 6-digit keys to activate vendor websites. One key = One site activation.</p>
               
               {lastGeneratedKey && (
                  <div className="mb-12 p-10 bg-blue-50 border-2 border-blue-600 border-dashed rounded-3xl animate-slide-up">
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Vendor Command Key</p>
                     <h2 className="text-6xl font-black text-blue-900 tracking-widest">{lastGeneratedKey}</h2>
                  </div>
               )}

               <button 
                  onClick={createActivationKey}
                  className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl hover:bg-blue-600 transition"
               >
                  Generate New Key
               </button>
            </div>
         )}
      </main>

      {/* Order Details View (The Fix) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6" onClick={() => setSelectedOrder(null)}>
           <div className="bg-white w-full max-w-4xl p-12 md:p-16 rounded-[60px] relative shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-xl font-black hover:bg-slate-200 transition">✕</button>
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12 border-b border-slate-100 pb-12">
                 <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Transaction Record</span>
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">Order Details</h2>
                    <p className="text-slate-400 font-bold text-sm mt-2">ID: {selectedOrder.id} • Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                 </div>
                 <div className="text-left md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payload</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {selectedOrder.totalAmount.toLocaleString()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div>
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Customer Intelligence</h4>
                       <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                          <p className="text-xl font-black text-slate-900">{selectedOrder.customerName}</p>
                          <p className="text-slate-600 font-bold text-sm">Ph: {selectedOrder.customerPhone}</p>
                          <p className="text-slate-600 font-bold text-sm">Em: {selectedOrder.customerEmail}</p>
                          <div className="h-px bg-slate-200 my-4"></div>
                          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Shipping Cluster</p>
                          <p className="text-slate-700 font-bold leading-relaxed">{selectedOrder.customerAddress}</p>
                       </div>
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Vendor Node</h4>
                       <div className="p-6 bg-slate-900 rounded-3xl text-white">
                          <p className="text-xl font-black">{selectedOrder.shopName}</p>
                          <p className="text-blue-400 font-bold text-xs uppercase mt-1 tracking-widest">Store ID: {selectedOrder.shopId}</p>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Cart Snapshot</h4>
                    <div className="space-y-4">
                       {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex gap-6 items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <div className="w-16 h-16 bg-white rounded-xl p-2">
                                <img src={item.productImageUrl} className="h-full w-full object-contain" alt="p" />
                             </div>
                             <div className="flex-1">
                                <p className="font-black text-slate-900">{item.productName}</p>
                                <p className="text-slate-500 font-bold text-[10px] uppercase">Qty: {item.quantity} | {item.size || 'N/A'}</p>
                             </div>
                             <p className="text-lg font-black text-slate-900">Rs. {item.price.toLocaleString()}</p>
                          </div>
                       ))}
                       <div className="pt-6 border-t border-slate-200 mt-6 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Fee (5%)</span>
                          <span className="font-black text-slate-900">Rs. {(selectedOrder.totalAmount * 0.05).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
