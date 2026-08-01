import React, { useState, useEffect } from 'react';
import { appClient } from '@/api/appClient';
import { Globe, Lock, ArrowRight, X, RefreshCw, MapPin } from 'lucide-react';

const DYSON_LOGO = "/assets/dyson-logo.png";

export default function LocalPulsePopup() {
  const [step, setStep] = useState('zip'); // zip | loading | preview | capture | done
  const [zip, setZip] = useState('');
  const [report, setReport] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show popup after 4 seconds if not previously dismissed
    const alreadyDismissed = sessionStorage.getItem('dnn_pulse_dismissed');
    const alreadyJoined = localStorage.getItem('dnn_power_base_joined');
    if (!alreadyDismissed && !alreadyJoined) {
      const t = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('dnn_pulse_dismissed', '1');
    setVisible(false);
    setDismissed(true);
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (zip.length < 5) return;
    setStep('loading');
    const res = await appClient.functions.invoke('dnnHyperLocalReport', { zip_code: zip, action: 'generate' });
    if (res.data?.success) {
      setReport(res.data.report);
      setStep('preview');
    } else {
      setStep('zip');
    }
  };

  const handleCapture = async (e) => {
    e.preventDefault();
    setCapturing(true);
    await appClient.functions.invoke('dnnHyperLocalReport', {
      action: 'capture',
      email,
      full_name: name,
      zip_code: zip,
    });
    localStorage.setItem('dnn_power_base_joined', '1');
    setCapturing(false);
    setStep('done');
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.3)' }}>

        {/* Gold top bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #e8c84a, #D4AF37, #b8920a)' }} />

        <button onClick={handleDismiss} className="absolute top-3 right-3 text-slate-600 hover:text-white transition p-1">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4" style={{ color: '#D4AF37' }} />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>DNN Intelligence Bureau</span>
          </div>

          {/* Step: ZIP entry */}
          {step === 'zip' && (
            <>
              <h2 className="text-xl font-black text-white mt-2 mb-1">Your Local Market Pulse</h2>
              <p className="text-sm text-slate-400 mb-5">Enter your ZIP code. We'll generate a 200-word relocation intelligence brief for your specific market — in seconds.</p>
              <form onSubmit={handleZipSubmit} className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    value={zip}
                    onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Enter ZIP code"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white font-mono text-lg focus:outline-none"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }}
                    maxLength={5}
                    required
                  />
                </div>
                <button type="submit" disabled={zip.length < 5}
                  className="w-full py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-40 transition"
                  style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)' }}>
                  Get My Market Brief <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-center text-[10px] text-slate-600 mt-3">No email required to preview. Free intelligence.</p>
            </>
          )}

          {/* Step: Loading */}
          {step === 'loading' && (
            <div className="py-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#D4AF37' }} />
              <p className="text-white font-bold mb-1">Scanning your market...</p>
              <p className="text-xs text-slate-400">The AI Reporter is analyzing ZIP {zip}. Takes 15–25 seconds.</p>
            </div>
          )}

          {/* Step: Preview (soft gate) */}
          {step === 'preview' && report && (
            <>
              <div className="mt-2 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-mono">{report.location_name} · {zip}</span>
                  {report.key_stat && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>{report.key_stat}</span>
                  )}
                </div>
                <h2 className="text-lg font-black text-white leading-snug">{report.report_title}</h2>
              </div>

              {/* Free teaser */}
              <p className="text-sm text-slate-300 leading-relaxed mb-2">{report.teaser}</p>

              {/* Blurred gate */}
              <div className="relative">
                <p className="text-sm text-slate-400 leading-relaxed select-none" style={{ filter: 'blur(5px)', userSelect: 'none' }}>
                  {report.full_report?.slice(report.teaser?.length || 0, (report.teaser?.length || 0) + 300)}
                </p>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(to bottom, transparent, #0f0f0f 40%)', backdropFilter: 'none' }}>
                </div>
              </div>

              <div className="mt-4 rounded-xl p-4 text-center" style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: '#D4AF37' }} />
                <p className="text-sm font-bold text-white mb-0.5">Join the DNN Power Base</p>
                <p className="text-xs text-slate-400 mb-3">Get the full report + daily relocation intelligence. Free.</p>
                <button onClick={() => setStep('capture')}
                  className="w-full py-2.5 rounded-xl font-bold text-black transition"
                  style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)' }}>
                  Unlock Full Report →
                </button>
              </div>
            </>
          )}

          {/* Step: Email capture */}
          {step === 'capture' && (
            <>
              <h2 className="text-xl font-black text-white mt-2 mb-1">Join the Power Base</h2>
              <p className="text-sm text-slate-400 mb-4">Enter your email to unlock the full {report?.location_name} brief and get daily DNN intelligence.</p>
              <form onSubmit={handleCapture} className="space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address *"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)' }} />
                <button type="submit" disabled={capturing || !email}
                  className="w-full py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)' }}>
                  {capturing ? <><RefreshCw className="w-4 h-4 animate-spin" />Joining...</> : 'Unlock Full Report →'}
                </button>
              </form>
              <p className="text-[10px] text-slate-600 text-center mt-2">No spam. No sales pitch. Pure intelligence.</p>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && report && (
            <>
              <div className="pt-2 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.2)' }}>
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-xs font-bold text-green-400">You're in the Power Base.</p>
                </div>
                <h2 className="text-lg font-black text-white leading-snug mb-3">{report.report_title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{report.full_report}</p>
                {report.suggested_destination && (
                  <div className="mt-4 rounded-lg px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4AF37' }} />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Top Relocation Destination</p>
                      <p className="text-sm font-bold text-white">{report.suggested_destination}</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handleDismiss}
                className="w-full mt-4 py-2.5 rounded-xl font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #e8c84a, #D4AF37, #b8920a)' }}>
                Explore Dyson & Dyson →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}