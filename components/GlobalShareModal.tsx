
import React, { useState } from 'react';
import { ShareIcon, QrCodeIcon, DownloadIcon } from './IconComponents.tsx';

interface GlobalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

const GlobalShareModal: React.FC<GlobalShareModalProps> = ({ isOpen, onClose, title, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.log("Share failed", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div 
        className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[40px] p-8 shadow-2xl animate-slide-up relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-400"></div>
        
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-black uppercase tracking-tighter">Global Broadcast</h2>
           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition">✕</button>
        </div>

        <div className="flex flex-col items-center mb-10">
           <div className="w-48 h-48 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 p-4">
              {/* Simulated QR Code for Global App Identity */}
              <div className="w-full h-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-4">
                 <QrCodeIcon className="w-16 h-16 text-blue-500 mb-2" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Scan to Open</span>
              </div>
           </div>
           <p className="text-center text-slate-400 text-xs font-bold px-10">Scan this code with any mobile camera to instantly sync this product to their screen.</p>
        </div>

        <div className="space-y-4">
           <div className="flex bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 truncate mr-4">{url}</span>
              <button 
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}
              >
                {copied ? 'Linked!' : 'Copy'}
              </button>
           </div>
           
           <button 
             onClick={handleNativeShare}
             className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition"
           >
             <ShareIcon className="w-4 h-4" /> Share with Global Network
           </button>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
              <DownloadIcon className="w-3 h-3" /> Encrypted Global Relay Protocol
           </p>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};

export default GlobalShareModal;
