
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import ShopFront from './components/ShopFront.tsx';
import LandingPage from './components/LandingPage.tsx';
import { Seller, Product, Order, AdminNotification } from './types.ts';
import { api } from './services/api.ts';
import { generateAdminNotification } from './services/notificationService.ts';

const App: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global Hydration - Works across refreshes and direct links
  useEffect(() => {
    const init = async () => {
      try {
        // Fix: Use the correct method names as defined in services/api.ts
        const [s, p, o] = await Promise.all([
          api.fetchAllSellers(),
          api.fetchAllProducts(),
          api.fetchAllOrders()
        ]);
        setSellers(s);
        setProducts(p);
        setOrders(o);
      } catch (err) {
        console.error("Initial Sync Failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleUpdateSellers = async (updated: Seller[]) => {
    const lastSeller = updated[updated.length - 1];
    if (lastSeller) await api.saveSeller(lastSeller);
    setSellers(updated);

    // AI Notifications
    if (updated.length > sellers.length && lastSeller) {
      try {
        const notification = await generateAdminNotification('NEW_SELLER', lastSeller);
        setNotifications(prev => [notification, ...prev]);
      } catch (err) { console.error(err); }
    }
  };

  const handleToggleSellerStatus = async (sellerId: string) => {
    // Fix: Use toggleSeller method from api.ts
    const updatedSellers = await api.toggleSeller(sellerId);
    setSellers(updatedSellers);
  };

  const handleUpdateProducts = async (updated: Product[]) => {
    const lastProduct = updated[updated.length - 1];
    if (lastProduct) await api.saveProduct(lastProduct);
    setProducts(updated);
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    await api.saveOrder(newOrder);
    setOrders(prev => [...prev, newOrder]);
    try {
      const notification = await generateAdminNotification('NEW_ORDER', newOrder);
      setNotifications(prev => [notification, ...prev]);
    } catch (err) { console.error(err); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131921] flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-[#febd69] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Global Sync Active</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage sellers={sellers} products={products} />} />
          <Route path="/admin/*" element={
            <AdminDashboard 
              sellers={sellers} 
              orders={orders} 
              notifications={notifications}
              onUpdateOrders={setOrders}
              onUpdateSellers={handleUpdateSellers}
              onToggleSellerStatus={handleToggleSellerStatus}
            />
          } />
          <Route path="/seller/*" element={
            <SellerDashboard 
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              sellers={sellers}
              products={products}
              orders={orders}
              onUpdateProducts={handleUpdateProducts}
              onUpdateSellers={handleUpdateSellers}
            />
          } />
          <Route path="/shop/:slug" element={
            <ShopFront 
              sellers={sellers} 
              products={products} 
              onPlaceOrder={handlePlaceOrder}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
