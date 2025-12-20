
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center font-bold text-2xl text-green-700" to="/">
          PK-MART
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/seller">
            Register as Seller
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/admin">
            Admin Portal
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-green-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                  Own Your <span className="text-green-600">Online Store</span> in Pakistan
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Build your business. We handle the delivery and payments. You earn 5% on every order you bring to the platform.
                </p>
              </div>
              <div className="space-x-4">
                <Link to="/seller" className="inline-flex h-12 items-center justify-center rounded-full bg-green-600 px-8 text-sm font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:scale-105">
                  Become a Seller
                </Link>
                <Link to="/admin" className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-8 text-sm font-semibold shadow-sm transition-all hover:bg-gray-50">
                  Manage Platform
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-green-100 p-5 rounded-2xl">
                  <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                </div>
                <h3 className="text-2xl font-bold">Fast Payouts</h3>
                <p className="text-gray-500">Get your commission directly in your JazzCash or Easypaisa account every week.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-green-100 p-5 rounded-2xl">
                  <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-2xl font-bold">Zero Risk</h3>
                <p className="text-gray-500">You don't need to worry about inventory or delivery. Admin handles everything from packing to shipping.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-green-100 p-5 rounded-2xl">
                  <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-2xl font-bold">Trust of Cash on Delivery</h3>
                <p className="text-gray-500">Integrated Cash on Delivery (COD) for all customers across Pakistan ensures high conversion rates.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
        <p className="text-xs text-gray-500 font-medium">© 2024 PK-Mart Pakistan. Empowering local entrepreneurs.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
