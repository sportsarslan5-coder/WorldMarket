
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
      const [sh, p, o] = await Promise.all([
        api.fetchAllShops(),
        api.fetchAllProducts(),
        api.fetchAllOrders()
      ]);
      setShops(sh);
      setProducts(p);
      setOrders(o);
      
      // Map shops to sellers for legacy compatibility
      setSellers(sh.map(s => ({
        id: s.ownerId,
        fullName: s.name,
        email: s.email,
        phoneNumber: s.whatsappNumber,
        shopId: s.id,
        joinedAt: s.joinedAt,
        payoutInfo: s.payoutInfo
      })));
    } catch (err) {
      console.error("Cloud Sync Failed:", err);
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

  // Fix: Removed unused handleToggleSellerStatus which was only used for an invalid prop in AdminDashboard.
  // AdminDashboard manages shop status updates internally.

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">BOOTING MASTER NODE</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Fix: LandingPage does not accept props, it manages its own state and data fetching. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/*" element={
            <AdminDashboard 
              notifications={notifications}
              onRefresh={syncData}
              /* Fix: Removed onToggleSellerStatus as it is not declared in AdminDashboard props. */
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
