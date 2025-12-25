
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import VendorLanding from './components/VendorLanding.tsx';
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
        api.fetchGlobalProducts(),
        api.fetchAllOrders()
      ]);
      setShops(sh);
      setProducts(p);
      setOrders(o);
      
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/sell" element={<VendorLanding />} />
          <Route path="/admin/*" element={
            <AdminDashboard 
              notifications={notifications}
              onRefresh={syncData}
            />
          } />
          <Route path="/seller/*" element={<SellerDashboard />} />
          <Route path="/shop/:slug" element={<ShopFront />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
