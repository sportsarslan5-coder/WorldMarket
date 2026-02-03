
import React, { useState } from 'react';
import { api } from '../services/api.ts';

const VendorLanding: React.FC = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const seller = await api.registerSeller({
      name: form.name,
      storeName: form.name,
      whatsapp: form.phone,
      email: form.email,
      location: 'Online',
      bankAccount: 'N/A'
    });
    setGeneratedLink(`${window.location.origin}/${seller.slug}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-8">
      <div className="max-w-4xl mx-auto py-24 text-center">
        {!generatedLink ? (
          <>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-8">
              Launch Your <span className="text-blue-600">Store.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto uppercase tracking-widest">
              Register now and get your unique link to start selling our premium inventory.
            </p>

            <form onSubmit={handleRegister} className="max-w-md mx-auto space-y-4 bg-slate-50 p-10 rounded-[48px] border-2 border-slate-900">
               <input required placeholder="Your Business Name" className="w-full h-16 px-6 bg-white border-2 border-slate-900 rounded-2xl font-bold outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
               <input required type="tel" placeholder="WhatsApp Number" className="w-full h-16 px-6 bg-white border-2 border-slate-900 rounded-2xl font-bold outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
               <input required type="email" placeholder="Email Address" className="w-full h-16 px-6 bg-white border-2 border-slate-900 rounded-2xl font-bold outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
               <button className="w-full h-20 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition active:scale-95">
                  Generate My Store Link
               </button>
            </form>
          </>
        ) : (
          <div className="bg-slate-900 text-white p-16 rounded-[64px] shadow-2xl animate-fade-in border-4 border-blue-600">
             <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
             </div>
             <h2 className="text-4xl font-black uppercase italic mb-4">You Are Live!</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-12">Your unique store link has been generated and activated.</p>
             
             <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4">Copy & Share on WhatsApp</p>
                <code className="text-xl font-mono font-bold break-all">{generatedLink}</code>
                <button 
                  onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }}
                  className="mt-8 px-12 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition"
                >
                  Copy Link
                </button>
             </div>
             <div className="mt-12">
                <a href={generatedLink} className="text-blue-500 font-black uppercase tracking-widest hover:underline">Preview My Store →</a>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorLanding;
