
import React, { useState, useEffect } from 'react';

interface JazzCashGatewayProps {
  amount: number;
  merchantPhone: string;
  onSuccess: (tid: string) => void;
  onCancel: () => void;
}

const JazzCashGateway: React.FC<JazzCashGatewayProps> = ({ amount, merchantPhone, onSuccess, onCancel }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [step, setStep] = useState<'details' | 'processing' | 'pin' | 'verifying'>('details');
  const [tid, setTid] = useState('');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => setStep('pin'), 1500);
  };

  const handlePinSubmit = () => {
    setStep('processing');
    const newTid = 'JC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setTid(newTid);
    // Simulate prompt sent to phone
    setTimeout(() => setStep('verifying'), 2000);
  };

  useEffect(() => {
    if (step === 'verifying') {
      // Simulate checking merchant account balance and settlement
      const timer = setTimeout(() => {
        onSuccess(tid);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, tid, onSuccess]);

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/95 flex items-center justify-center p-4 font-sans backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-fade-in border border-white/20">
        {/* Gateway Branding */}
        <div className="bg-[#D32F2F] p-6 text-white">
           <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Secured Gateway</span>
                 <span className="text-2xl font-black italic tracking-tighter">JazzCash</span>
              </div>
              <div className="text-right">
                 <span className="block text-[10px] uppercase font-black opacity-70">Payable PKR</span>
                 <span className="text-2xl font-black">Rs. {amount.toLocaleString()}</span>
              </div>
           </div>
           <div className="bg-white/10 p-3 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                 <svg className="w-4 h-4 text-[#D32F2F]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
              </div>
              <div className="text-[10px] font-bold leading-tight">
                 Destination: {merchantPhone}<br/>
                 <span className="opacity-70">PK MART OFFICIAL RECEIVING NODE</span>
              </div>
           </div>
        </div>

        <div className="p-8">
           {step === 'details' && (
             <form onSubmit={handlePay} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Wallet Number</label>
                   <input 
                     required
                     type="tel"
                     placeholder="03xxxxxxxxx"
                     className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-xl focus:border-[#D32F2F] transition-all"
                     value={mobileNumber}
                     onChange={e => setMobileNumber(e.target.value)}
                   />
                   <p className="text-[9px] text-slate-400 font-medium italic">Enter your 11-digit JazzCash mobile account number</p>
                </div>

                <button className="w-full h-16 bg-[#D32F2F] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#B71C1C] transition active:scale-95 shadow-xl shadow-red-900/20">
                  Authorize Payment
                </button>
                <button type="button" onClick={onCancel} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition">
                  Cancel & Return
                </button>
             </form>
           )}

           {step === 'processing' && (
             <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-14 h-14 border-4 border-[#D32F2F] border-t-transparent rounded-full animate-spin"></div>
                <div>
                   <p className="font-black text-slate-900 uppercase text-xs tracking-widest animate-pulse">Communicating with Node...</p>
                   <p className="text-slate-400 text-[10px] mt-2 font-medium">Establishing secure SSL relay</p>
                </div>
             </div>
           )}

           {step === 'pin' && (
             <div className="space-y-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-red-50 text-[#D32F2F] rounded-full flex items-center justify-center mx-auto">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                   <h3 className="text-xl font-black tracking-tight mb-2 uppercase italic">Check Phone</h3>
                   <p className="text-sm text-slate-500 font-medium px-4">An MPIN prompt has been sent to <span className="text-slate-900 font-bold">{mobileNumber}</span>. Enter your code on your phone to confirm.</p>
                </div>
                <div className="pt-6 border-t border-slate-100">
                   <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.3em] mb-4">Waiting for Approval...</p>
                   <button onClick={handlePinSubmit} className="text-[10px] font-black uppercase text-blue-600 hover:underline tracking-widest">Simulate Pin Entry</button>
                </div>
             </div>
           )}

           {step === 'verifying' && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                   </div>
                </div>
                <div>
                   <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Verifying Settlement</p>
                   <p className="text-slate-400 text-[10px] mt-2 font-medium italic">Confirming funds received in merchant account:<br/>{merchantPhone}</p>
                </div>
             </div>
           )}
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
           <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em]">Encrypted Banking Node Interface</span>
        </div>
      </div>
    </div>
  );
};

export default JazzCashGateway;
