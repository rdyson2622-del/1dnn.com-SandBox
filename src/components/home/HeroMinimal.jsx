import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroMinimal = () => {
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim() || scanning) return;
    setScanning(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!scanning) return;
    const start = Date.now();
    const duration = 3000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
      clearInterval(interval);
      navigate(`/relocation-intake?city=${encodeURIComponent(query.trim())}`);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4" style={{ paddingTop: '0.5rem', paddingBottom: '3rem' }}>
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <img
            src="/assets/dyson-logo.png"
            alt="Dyson & Dyson"
            className="h-[5.75rem] w-auto"
          />
        </div>
        <p className="display-heading" style={{ fontSize: '2.99rem', color: '#fff', marginBottom: '0.5rem' }}>Concierge</p>
        <p className="display-heading" style={{ fontSize: '2.275rem', color: '#D4AF37', marginBottom: '0.75rem' }}>Relocation Management</p>
        <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginBottom: '2rem' }}>At The Dyson &amp; Dyson Companies: We don't sell real estate. We manage your entire move.</p>
      </div>

      <form onSubmit={handleSearch} className="w-full max-w-lg relative">
        <div className="relative group rounded-full px-5 py-2 flex flex-col items-center justify-center" style={{ background: '#1A1A1A', border: '2px solid rgba(212,175,55,0.3)' }}>
          <div className="mb-2 text-center">
            <p className="text-xs font-medium mb-1" style={{ color: '#fff', letterSpacing: '0.08em' }}>WHERE DOES YOUR LIFESTYLE TAKE YOU NEXT?</p>
            <p className="text-xs" style={{ color: '#D4AF37', letterSpacing: '0.05em' }}>Enter your destination & include City, State or Zip Code</p>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder=""
            disabled={scanning}
            className="w-full bg-transparent text-white py-1.5 px-4 text-base focus:outline-none disabled:opacity-70 placeholder-gray-500"
          />


          <button type="submit" disabled={scanning} className="mt-2 bg-[#D4AF37] px-5 py-1.5 rounded-full text-black text-xs font-bold tracking-wide hover:bg-[#B8962E] transition-colors disabled:opacity-50 flex items-center gap-1">
            Search <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {scanning && (
          <div className="mt-4 px-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <p className="text-sm font-semibold tracking-wide" style={{ color: '#D4AF37' }}>
                Charlie is analyzing your destination market preparing for your profile information...
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.15)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #b8920a, #D4AF37, #e8c84a)',
                  boxShadow: '0 0 10px rgba(212,175,55,0.6)'
                }}
              />
            </div>
          </div>
        )}
      </form>

      <div className="mt-20 flex gap-8 text-xs uppercase tracking-widest text-white font-medium">
        <span>100% Free for Buyers</span>
        <span className="text-[#D4AF37]/50">•</span>
        <span>Human Managed - AI Assisted</span>
        <span className="text-[#D4AF37]/50">•</span>
        <span>International Network</span>
      </div>
    </div>
  );
};

export default HeroMinimal;