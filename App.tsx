
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import ShopFront from './components/ShopFront.tsx';
import LandingPage from './components/LandingPage.tsx';
import { Seller, Product, Order, AdminNotification, Shop } from './types.ts';
import { api } from './services/api.ts';
import { generateAdminNotification } from './services/notificationService.ts';

const App: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const syncData = useCallback(async () => {
    try {
      const [s, sh, p, o] = await Promise.all([
        api.fetchAllSellers(),
        api.fetchAllShops(),
        api.fetchAllProducts(),
        api.fetchAllOrders()
      ]);
      setSellers(s);
      setShops(sh);
      setProducts(p);
      setOrders(o);
    } catch (err) {
      console.error("Initial Sync Failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addNotification = useCallback(async (type: 'NEW_SELLER' | 'NEW_ORDER', data: any) => {
    const newNotif = await generateAdminNotification(type, data);
    setNotifications(prev => [newNotif, ...prev]);
    await syncData();
  }, [syncData]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  const handleToggleSellerStatus = async (sellerId: string) => {
    await api.toggleSeller(sellerId);
    await syncData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131921] flex flex-col items-center justify-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-[#febd69] border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">PK-MART GLOBAL SYNC</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage sellers={sellers} shops={shops} products={products} />} />
          <Route path="/admin/*" element={
            <AdminDashboard 
              shops={shops}
              sellers={sellers} 
              orders={orders} 
              notifications={notifications}
              onRefresh={syncData}
              onToggleSellerStatus={handleToggleSellerStatus}
            />
          } />
          <Route path="/seller/*" element={<SellerDashboard onNotify={addNotification} />} />
          <Route path="/shop/:slug" element={<ShopFront onNotify={addNotification} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
