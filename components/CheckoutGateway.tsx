
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CheckoutGateway: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'redirecting' | 'card_entry' | 'processing' | 'verifying'>('redirecting');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('card_entry');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulatePayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('verifying');
      setTimeout(() => {
        navigate(`/payment-success/${orderId}`);
      }, 2000);
    }, 2000);
  };

  const handleSimulateFailure = () => {
    setStep('processing');
    setTimeout(() => {
      navigate('/payment-failed');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
        {/* Verifone / 2Checkout Branding */}
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 block mb-1">Secure Checkout</span>
            <span className="text-2xl font-black italic tracking-tighter">Verifone <span className="text-blue-400">2Checkout</span></span>
          </div>
          <div className="text-right">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Reference ID</span>
             <span className="text-xs font-mono font-black">{orderId}</span>
          </div>
        </div>

        <div className="p-12 text-center">
          {step === 'redirecting' && (
            <div className="space-y-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h2 className="text-xl font-black uppercase tracking-tight italic">Redirecting to Secure Servers...</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Authenticating PK MART Node Session</p>
            </div>
          )}

          {step === 'card_entry' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-center gap-4 mb-8">
                 <img src="https://img.icons8.com/color/96/000000/visa.png" className="h-10 opacity-80" alt="Visa" />
                 <img src="https://img.icons8.com/color/96/000000/mastercard.png" className="h-10 opacity-80" alt="Mastercard" />
                 <img src="https://img.icons8.com/color/96/000000/amex.png" className="h-10 opacity-80" alt="Amex" />
              </div>

              <div className="space-y-4 text-left">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Card Number</label>
                    <div className="h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                       <span className="font-mono text-lg font-bold">**** **** **** 4242</span>
                       <span className="text-blue-500">🔒</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Expiry Date</label>
                    <div className="h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center font-bold">12 / 28</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">CVV</label>
                    <div className="h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center font-bold">***</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                 <button 
                   onClick={handleSimulatePayment}
                   className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition active:scale-95"
                 >
                   Confirm Worldwide Payment
                 </button>
                 <button 
                   onClick={handleSimulateFailure}
                   className="w-full text-slate-300 font-bold text-[9px] uppercase tracking-widest hover:text-red-500 transition"
                 >
                   Cancel Payment & Return to Merchant
                 </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-8 py-10 animate-fade-in">
              <div className="relative mx-auto w-20 h-20">
                 <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-2">Processing Transaction</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Encrypted Secure Bank Relay in progress...</p>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="space-y-8 py-10 animate-fade-in">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-2 text-green-600">Verification Success</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Authenticating settlement on PK MART Grid...</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
           <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] leading-relaxed">
             This is a secure checkout page powered by Verifone (2Checkout). <br/>
             PCI-DSS Level 1 Certified Node.
           </p>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-6 opacity-40">
        <img src="https://img.icons8.com/color/48/000000/norton-security.png" className="h-6 grayscale hover:grayscale-0 transition" alt="Norton" />
        <img src="https://img.icons8.com/color/48/000000/trustpilot.png" className="h-6 grayscale hover:grayscale-0 transition" alt="Trustpilot" />
        <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-6 grayscale hover:grayscale-0 transition" alt="Visa" />
      </div>
    </div>
  );
};

export default CheckoutGateway;
