
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import SellerRegistration from './components/SellerRegistration.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import Storefront from './components/Storefront.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import LandingPage from './components/LandingPage.tsx';

// Using HashRouter for 100% reliability in static/preview environments
const { HashRouter: Router, Routes, Route } = ReactRouterDOM as any;

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sell" element={<SellerRegistration />} />
          <Route path="/dashboard/:sellerId" element={<SellerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/:slug" element={<Storefront />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
