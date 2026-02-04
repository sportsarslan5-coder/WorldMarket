
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // REGION SECURITY CHECK
    const isUSA = phone.startsWith('+1');
    const isPakistan = phone.startsWith('+92');

    if (!isUSA && !isPakistan) {
      setError("ACCESS NOT ALLOWED: Only USA (+1) or Pakistan (+92) authorized regions permitted.");
      return;
    }

    // AUTH SIMULATION
    if (code === '2025-ADMIN') {
      localStorage.setItem('APS_ADMIN_AUTH', 'true');
      navigate('/admin-hq');
    } else {
      setError("Invalid Access Code.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-12 rounded-[56px] border border-white/10 animate-scale-in">
        <div className="text-center mb-12">
           <h1 className="text-3xl font-black uppercase tracking-tighter italic">ADMIN <span className="text-blue-500">NODE</span></h1>
           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2">Restricted Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verified Admin Phone</label>
            <input 
              required
              placeholder="+1 or +92 ..."
              className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold focus:border-blue-600 outline-none transition"
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Code</label>
            <input 
              required
              type="password"
              placeholder="••••••••"
              className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold focus:border-blue-600 outline-none transition"
              onChange={e => setCode(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}

          <button className="w-full h-18 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-slate-950 transition active:scale-95">
            Initialize Admin Node
          </button>
        </form>

        <div className="mt-12 text-center">
           <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Global Protocol V1.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
