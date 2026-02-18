'use client';

import { useState, useEffect } from 'react';
import { X, Share, Download, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BrowserType = 'chrome' | 'safari-ios' | 'safari-mac' | 'firefox' | 'edge' | 'samsung' | 'other';

function detectBrowser(): BrowserType {
  if (typeof window === 'undefined') return 'other';
  
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isMac = /macintosh/.test(ua) && !('ontouchend' in document);
  const isSamsung = /samsungbrowser/.test(ua);
  const isEdge = /edg\//.test(ua);
  const isFirefox = /firefox/.test(ua) && !/seamonkey/.test(ua);
  const isChrome = /chrome/.test(ua) && !/edg\//.test(ua) && !/samsungbrowser/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua);

  if (isSamsung) return 'samsung';
  if (isEdge) return 'edge';
  if (isIOS && isSafari) return 'safari-ios';
  if (isMac && isSafari) return 'safari-mac';
  if (isFirefox) return 'firefox';
  if (isChrome) return 'chrome';
  return 'other';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

export function PwaInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [browser, setBrowser] = useState<BrowserType>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) return;

    const detectedBrowser = detectBrowser();
    setBrowser(detectedBrowser);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const timer = setTimeout(() => {
      if (detectedBrowser !== 'chrome') {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (deferredPrompt) {
      setShowBanner(true);
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-background border-t shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-lg mx-auto relative">
        <button
          onClick={handleDismiss}
          className="absolute -top-1 right-0 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Chiudi"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <img src="/icons/icon-72x72.png" alt="Pittima App" className="h-12 w-12 rounded-xl" />
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Installa Pittima App</p>
            
            {deferredPrompt && (
              <>
                <p className="text-xs text-muted-foreground mt-1">
                  Installa l app per accesso rapido e notifiche push.
                </p>
                <Button size="sm" className="mt-2" onClick={handleInstallClick}>
                  <Download className="h-4 w-4 mr-1.5" />
                  Installa
                </Button>
              </>
            )}

            {!deferredPrompt && browser === 'safari-ios' && (
              <div className="text-xs text-muted-foreground mt-1 space-y-1.5">
                <p>Per installare l app su iPhone/iPad:</p>
                <div className="flex items-center gap-2">
                  <span className="bg-muted rounded px-1.5 py-0.5 font-medium inline-flex items-center gap-1">
                    <Share className="h-3 w-3" /> Condividi
                  </span>
                  <span>poi</span>
                  <span className="bg-muted rounded px-1.5 py-0.5 font-medium inline-flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Aggiungi alla schermata Home
                  </span>
                </div>
                <p className="text-[11px] opacity-75">Necessario per ricevere le notifiche push su iOS.</p>
              </div>
            )}

            {!deferredPrompt && browser === 'safari-mac' && (
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <p>Per installare: vai nel menu File e poi Aggiungi al Dock</p>
              </div>
            )}

            {!deferredPrompt && browser === 'firefox' && (
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <p>Firefox non supporta l installazione di web app.</p>
                <p>Per la migliore esperienza, apri questa pagina con Chrome o Safari.</p>
              </div>
            )}

            {!deferredPrompt && (browser === 'other' || browser === 'edge' || browser === 'samsung') && (
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <p>
                  Cerca l opzione Installa app o Aggiungi alla schermata Home nel menu del browser
                  <MoreVertical className="h-3 w-3 inline ml-1" />
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
