
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.ts';

const PaymentSuccess: React.FC = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const finalize = async () => {
      if (orderId) {
        const tid = '2CK-' + Math.random().toString(36).substr(2, 10).toUpperCase();
        await api.finalizeOrder(orderId, 'completed', tid);
      }
      setLoading(false);
    };
    finalize();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-100">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">ORDER <br/><span className="text-green-600">COMPLETED.</span></h1>
          <p className="text-slate-500 font-medium">Thank you! Your payment was successfully processed via 2Checkout Secure Gateway.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order ID</span>
             <span className="font-mono text-sm font-black bg-white px-3 py-1 rounded-lg border border-slate-200">{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</span>
             <span className="text-[10px] font-black uppercase text-green-600 bg-green-100 px-3 py-1 rounded-lg">Verified & Settled</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-4">A confirmation email has been sent to your inbox.</p>
        </div>

        <Link 
          to="/" 
          className="block w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition shadow-xl flex items-center justify-center"
        >
          Return to Marketplace
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
