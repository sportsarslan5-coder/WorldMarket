
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import SellerRegistration from './components/SellerRegistration.tsx';
import SellerDashboard from './components/SellerDashboard.tsx';
import Storefront from './components/Storefront.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

const { HashRouter: Router, Routes, Route, Link } = ReactRouterDOM as any;

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sell" element={<SellerRegistration />} />
          <Route path="/dashboard/:sellerId" element={<SellerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/:slug" element={<Storefront />} />
        </Routes>
      </div>
    </Router>
  );
};

const Home = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-6xl font-black italic tracking-tighter mb-6">AMZ<span className="text-blue-600">PRIME</span></h1>
    <p className="text-slate-500 max-w-md mb-12 uppercase font-bold tracking-widest">Pakistan's Premium Multi-Vendor ODM Marketplace</p>
    <div className="flex gap-4">
      <Link to="/sell" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">Start Selling</Link>
      <Link to="/admin" className="bg-white border-2 border-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest">Admin Portal</Link>
    </div>
  </div>
);

export default App;
