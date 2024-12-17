// app/_components/InstallPWA.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setPromptInstall(e);
      setSupportsPWA(true);
      
      // Check if user is on mobile and hasn't seen the prompt
      if (isMobile() && !localStorage.getItem('pwaPromptDismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleInstallClick = async () => {
    if (!promptInstall) {
      return;
    }
    
    promptInstall.prompt();
    
    const { outcome } = await promptInstall.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setPromptInstall(null);
    setShowBanner(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#6cab1f] text-white shadow-lg">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex-1">
          <p className="font-semibold">Install Print Portal</p>
          <p className="text-sm">Add to your home screen for quick access</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-white text-[#6cab1f] rounded-lg font-semibold hover:bg-gray-100"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-[#5a9019] rounded-full"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}