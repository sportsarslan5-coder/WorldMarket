
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import ShopFront from './components/ShopFront.tsx';
import LandingPage from './components/LandingPage.tsx';
import { Seller, Product, Order, AdminNotification } from './types.ts';
import { mockSellers, mockProducts, mockOrders } from './services/mockData.ts';
import { generateAdminNotification } from './services/notificationService.ts';

const App: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>(mockSellers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<Seller | null>(null);

  const handleUpdateSellers = async (updated: Seller[]) => {
    // Check if a new seller was added
    if (updated.length > sellers.length) {
      const newSeller = updated[updated.length - 1];
      const notification = await generateAdminNotification('NEW_SELLER', newSeller);
      setNotifications(prev => [notification, ...prev]);
    }
    setSellers(updated);
  };

  const handleUpdateProducts = (updated: Product[]) => setProducts(updated);
  
  const handleUpdateOrders = (updated: Order[]) => setOrders(updated);

  const handlePlaceOrder = async (newOrder: Order) => {
    setOrders([...orders, newOrder]);
    const notification = await generateAdminNotification('NEW_ORDER', newOrder);
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/*" element={
            <AdminDashboard 
              sellers={sellers} 
              orders={orders} 
              notifications={notifications}
              onUpdateOrders={handleUpdateOrders}
              onUpdateSellers={handleUpdateSellers}
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
