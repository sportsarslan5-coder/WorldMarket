
import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailed: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-red-100">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">PAYMENT <br/><span className="text-red-600">FAILED.</span></h1>
          <p className="text-slate-500 font-medium">Something went wrong with your transaction. Your card was not charged.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-4">
          <p className="text-xs font-bold text-slate-600">Common reasons:</p>
          <ul className="text-[10px] font-black text-slate-400 uppercase tracking-widest space-y-2">
            <li>• Insufficient funds in card account</li>
            <li>• 3D Secure authentication failed</li>
            <li>• Card expired or blocked for global use</li>
          </ul>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => window.history.back()}
            className="block w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-xl"
          >
            Try Again
          </button>
          <Link 
            to="/" 
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
