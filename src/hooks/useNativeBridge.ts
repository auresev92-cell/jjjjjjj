import { useEffect, useState } from 'react';
import { nativeBridge, DeviceInfo } from '../services/nativeBridgeService';

export function useNativeBridge() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(nativeBridge.getDeviceInfo());
  const [isConnected, setIsConnected] = useState<boolean>(navigator.onLine);
  const [appState, setAppState] = useState<'active' | 'background'>('active');

  useEffect(() => {
    const unsubNetwork = nativeBridge.addListener('networkState', (data) => {
      setIsConnected(data.isConnected);
    });

    const unsubApp = nativeBridge.addListener('appState', (data) => {
      setAppState(data.state);
    });

    return () => {
      unsubNetwork();
      unsubApp();
    };
  }, []);

  return {
    haptics: nativeBridge.haptics,
    share: (data: { title?: string; text?: string; url?: string }) => nativeBridge.share(data),
    copyToClipboard: (text: string) => nativeBridge.copyToClipboard(text),
    authenticateBiometric: (reason?: string) => nativeBridge.authenticateBiometric(reason),
    getCurrentPosition: () => nativeBridge.getCurrentPosition(),
    deviceInfo,
    isConnected,
    appState
  };
}
