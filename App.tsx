
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import ShopFront from './components/ShopFront.tsx';
import LandingPage from './components/LandingPage.tsx';
import { Seller, Product, Order } from './types.ts';
import { mockSellers, mockProducts, mockOrders } from './services/mockData.ts';

const App: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>(mockSellers);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [currentUser, setCurrentUser] = useState<Seller | null>(null);

  const handleUpdateSellers = (updated: Seller[]) => setSellers(updated);
  const handleUpdateProducts = (updated: Product[]) => setProducts(updated);
  const handleUpdateOrders = (updated: Order[]) => setOrders(updated);

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/*" element={
            <AdminDashboard 
              sellers={sellers} 
              orders={orders} 
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
              onPlaceOrder={(newOrder) => setOrders([...orders, newOrder])}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
