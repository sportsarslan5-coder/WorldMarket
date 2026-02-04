
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import LandingPage from './components/LandingPage.tsx';
import Storefront from './components/Storefront.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import SellerRegistration from './components/SellerRegistration.tsx';
import AdminLogin from './components/AdminLogin.tsx';

// HashRouter is essential for avoiding 404 errors on direct navigation across different devices
const { HashRouter: Router, Routes, Route } = ReactRouterDOM as any;

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sell" element={<SellerRegistration />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-hq" element={<AdminDashboard />} />
          
          {/* Support for direct show slugs via /#/name */}
          <Route path="/:slug" element={<Storefront />} />
          <Route path="/show/:slug" element={<Storefront />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
