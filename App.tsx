
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import ShopFront from './components/ShopFront.tsx';
import LandingPage from './components/LandingPage.tsx';
import { Seller, Product, Order, AdminNotification } from './types.ts';
import { db } from './services/db.ts';
import { generateAdminNotification } from './services/notificationService.ts';

const App: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Hydration from Persistent Storage
  useEffect(() => {
    const hydrate = () => {
      setSellers(db.getSellers());
      setProducts(db.getProducts());
      setOrders(db.getOrders());
      setIsLoading(false);
    };
    hydrate();
  }, []);

  const handleUpdateSellers = async (updated: Seller[]) => {
    // Only persist the latest addition/update
    const lastSeller = updated[updated.length - 1];
    if (lastSeller) db.saveSeller(lastSeller);
    
    if (updated.length > sellers.length) {
      try {
        const notification = await generateAdminNotification('NEW_SELLER', lastSeller);
        setNotifications(prev => [notification, ...prev]);
      } catch (err) {
        console.error("AI Notification Error:", err);
      }
    }
    setSellers(updated);
  };

  const handleToggleSellerStatus = (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;
    const newStatus = seller.status === 'active' ? 'inactive' : 'active';
    const updatedSellers = db.updateSellerStatus(sellerId, newStatus);
    setSellers(updatedSellers);
  };

  const handleUpdateProducts = (updated: Product[]) => {
    const lastProduct = updated[updated.length - 1];
    if (lastProduct) db.saveProduct(lastProduct);
    setProducts(updated);
  };

  const handleUpdateOrders = (updated: Order[]) => {
    // Note: Admin dashboard might update existing orders, for now we treat orders as push-only
    setOrders(updated);
  };

  const handlePlaceOrder = async (newOrder: Order) => {
    db.saveOrder(newOrder);
    setOrders(prev => [...prev, newOrder]);
    try {
      const notification = await generateAdminNotification('NEW_ORDER', newOrder);
      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      console.error("AI Notification Error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-16 h-16 border-4 border-[#febd69] border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-black uppercase tracking-widest">Loading PK-MART</h2>
        <p className="text-slate-500 font-bold mt-2">Connecting to Seller Protex Secure Database...</p>
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
              onUpdateOrders={handleUpdateOrders}
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
