// app/_components/InstallPWA.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { X, Share2 } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
    
    console.log({
      userAgent: navigator.userAgent,
      isIOSDevice,
      isAndroid,
      hasPromptBeenDismissed: localStorage.getItem('pwaPromptDismissed')
    });

    // Show banner for iOS if not dismissed before
    if (isIOSDevice && !localStorage.getItem('pwaPromptDismissed')) {
      setShowBanner(true);
      return;
    }

    // Handle non-iOS devices
    const handler = (e: any) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
      
      // Show banner for Android devices if not dismissed
      if (isAndroid && !localStorage.getItem('pwaPromptDismissed')) {
        setShowBanner(true);
      }
    };

    // If it's Android and banner hasn't been dismissed, show it
    if (isAndroid && !localStorage.getItem('pwaPromptDismissed')) {
      setShowBanner(true);
    }

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      console.log("IOS device - cannot trigger install prompt");
      return;
    }

    if (!promptInstall) {
      console.log("No install prompt available");
      return;
    }
    
    console.log("Triggering install prompt");
    promptInstall.prompt();
    
    const { outcome } = await promptInstall.userChoice;
    console.log('User choice outcome:', outcome);
    
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
          {isIOS ? (
            <p className="text-sm">
              Tap the share button <Share2 className="inline w-4 h-4" /> and select 'Add to Home Screen'
            </p>
          ) : (
            <p className="text-sm">Add to your home screen for quick access</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-white text-[#6cab1f] rounded-lg font-semibold hover:bg-gray-100"
            >
              Install
            </button>
          )}
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