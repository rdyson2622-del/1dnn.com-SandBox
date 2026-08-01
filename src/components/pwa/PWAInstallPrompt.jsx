import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOLD = '#D4AF37';

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Detect iOS
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // Detect Chrome/Chromium
    const isChromium = window.chrome !== null && typeof window.chrome !== 'undefined';
    setIsChrome(isChromium);

    // Listen for beforeinstallprompt event (Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    // Show PWA prompt after 3 seconds if user hasn't dismissed
    if (!localStorage.getItem('pwaPromptDismissed')) {
      const timer = setTimeout(() => {
        if (!deferredPrompt && (isIOS || isChrome)) {
          setShow(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShow(false);
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 max-w-sm z-40"
      >
        <div
          className="rounded-2xl p-5 shadow-lg"
          style={{ background: '#0a0a0a', border: `2px solid ${GOLD}`, boxShadow: `0 0 24px rgba(212,175,55,0.3)` }}
        >
          <div className="flex items-start gap-4">
            <Smartphone className="w-6 h-6 shrink-0" style={{ color: GOLD }} />
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1" style={{ color: '#fff' }}>
                {isIOS ? 'Add to Home Screen' : 'Install App'}
              </h3>
              <p className="text-xs mb-4" style={{ color: '#888' }}>
                {isIOS
                  ? 'Tap Share, then "Add to Home Screen" to access Dyson Relocation like an app.'
                  : 'Install Dyson Relocation on your device for quick access. Works offline too.'}
              </p>

              {isIOS ? (
                <div className="text-xs mb-3 p-2 rounded-lg" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                  <strong>iOS Instructions:</strong>
                  <ol className="mt-2 space-y-1 ml-4 list-decimal">
                    <li>Tap the Share icon (arrow up)</li>
                    <li>Scroll and tap "Add to Home Screen"</li>
                    <li>Tap "Add" — done!</li>
                  </ol>
                </div>
              ) : null}

              <div className="flex gap-2">
                {deferredPrompt && !isIOS && (
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="flex-1"
                    style={{ background: GOLD, color: '#000', fontWeight: 'bold' }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Install
                  </Button>
                )}
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  style={{ color: '#888' }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}