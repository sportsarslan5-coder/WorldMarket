
import React, { useState } from 'react';

interface JazzCashGatewayProps {
  amount: number;
  merchantPhone: string;
  onSuccess: (tid: string) => void;
  onCancel: () => void;
}

const JazzCashGateway: React.FC<JazzCashGatewayProps> = ({ amount, merchantPhone, onSuccess, onCancel }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [step, setStep] = useState<'details' | 'processing' | 'pin'>('details');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => setStep('pin'), 2000);
  };

  const handlePinSubmit = () => {
    setStep('processing');
    const tid = 'JC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setTimeout(() => onSuccess(tid), 2500);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="bg-[#D32F2F] p-6 text-white flex justify-between items-center">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Secure Checkout</span>
              <span className="text-xl font-black tracking-tighter italic">JazzCash</span>
           </div>
           <div className="text-right">
              <span className="block text-[10px] uppercase font-bold opacity-80">Total Amount</span>
              <span className="text-xl font-black">Rs. {amount.toLocaleString()}</span>
           </div>
        </div>

        <div className="p-8">
           {step === 'details' && (
             <form onSubmit={handlePay} className="space-y-6">
                <div className="space-y-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Paying To Merchant</p>
                      <p className="font-bold text-slate-900">{merchantPhone}</p>
                      <p className="text-[9px] font-bold text-green-600">PK MART Verified Official</p>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-900">Your Mobile Account</label>
                      <input 
                        required
                        type="tel"
                        placeholder="e.g. 03xxxxxxxxx"
                        className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-lg focus:border-[#D32F2F] transition"
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value)}
                      />
                   </div>
                </div>

                <div className="space-y-3">
                   <button className="w-full h-16 bg-[#D32F2F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#B71C1C] transition active:scale-95 shadow-xl shadow-red-900/20">
                     Proceed to Pay
                   </button>
                   <button type="button" onClick={onCancel} className="w-full h-12 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition">
                     Cancel Transaction
                   </button>
                </div>
             </form>
           )}

           {step === 'processing' && (
             <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-12 h-12 border-4 border-[#D32F2F] border-t-transparent rounded-full animate-spin"></div>
                <div>
                   <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Encrypting Relay...</p>
                   <p className="text-slate-400 text-[10px] mt-1">Connecting to JazzCash Secure Nodes</p>
                </div>
             </div>
           )}

           {step === 'pin' && (
             <div className="space-y-8 animate-fade-in text-center">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                   <h3 className="text-xl font-black tracking-tight mb-2">Check Your Phone</h3>
                   <p className="text-sm text-slate-500 font-medium px-4">An MPIN prompt has been sent to your JazzCash account at <span className="text-slate-900 font-bold">{mobileNumber}</span>.</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                   <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-4 italic">Waiting for MPIN Confirmation...</p>
                   {/* Simulation trigger for Demo */}
                   <button onClick={handlePinSubmit} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Simulate MPIN Success</button>
                </div>
             </div>
           )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-center gap-2">
           <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">256-Bit SSL SECURE NODE</span>
        </div>
      </div>
    </div>
  );
};

export default JazzCashGateway;
