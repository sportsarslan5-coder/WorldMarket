
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Seller } from '../types.ts';

const SellerDashboard: React.FC = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (sellerId) {
        const s = await api.getSellerById(sellerId);
        setSeller(s);
      }
      setLoading(false);
    };
    loadData();
  }, [sellerId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#25D366] uppercase tracking-widest italic text-2xl">
      Syncing Merchant HQ...
    </div>
  );

  const shareLink = `${window.location.origin}/#/${seller?.slug}`;

  return (
    <div className="min-h-screen bg-white font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 border-b pb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">
              {seller?.storeName} <span className="text-[#25D366]">Merchant HQ</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Distribution Node • Admin Patch Shop</p>
          </div>
          <div className="flex gap-4">
             <Link to={`/${seller?.slug}`} target="_blank" className="bg-slate-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366] transition shadow-lg">View Storefront</Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Commission Earned</p>
             <p className="text-4xl font-black italic tracking-tighter text-slate-950">Rs. 0.00</p>
             <p className="text-[9px] font-bold text-blue-600 mt-4 uppercase tracking-widest">Payout Threshold: Rs. 5000</p>
          </div>
          <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Commission Rate</p>
             <p className="text-4xl font-black italic tracking-tighter text-slate-950">5%</p>
             <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Fixed Merchant Split</p>
          </div>
          <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Store Status</p>
             <p className="text-4xl font-black italic tracking-tighter text-emerald-500 uppercase">Live</p>
             <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Verified Distribution Node</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-12 rounded-[56px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
           <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Share Your Link</h3>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">Customers ordering through this link automatically attribute commission to your merchant account.</p>
           
           <div className="flex bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 items-center justify-between">
              <code className="text-lg font-mono font-bold text-[#25D366] break-all">{shareLink}</code>
              <button 
                onClick={() => { navigator.clipboard.writeText(shareLink); alert("Link Copied!"); }}
                className="bg-white text-slate-950 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition"
              >
                Copy URL
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
