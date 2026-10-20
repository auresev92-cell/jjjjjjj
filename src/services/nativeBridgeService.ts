/**
 * Native Bridge Service - Simulating React Native & Capacitor Mobile APIs
 * Provides haptics, biometrics, native share, device info, geolocation, clipboard, and app state.
 */

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  model: string;
  isNative: boolean;
  batteryLevel?: number;
  isDarkMode: boolean;
}

class NativeBridgeService {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  constructor() {
    // Listen to online/offline status
    window.addEventListener('online', () => this.emit('networkState', { isConnected: true }));
    window.addEventListener('offline', () => this.emit('networkState', { isConnected: false }));

    // Listen to visibility/app state
    document.addEventListener('visibilitychange', () => {
      const state = document.hidden ? 'background' : 'active';
      this.emit('appState', { state });
    });
  }

  /**
   * Haptics feedback (React Native Haptics / Capacitor Haptics equivalent)
   */
  public haptics = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
      if ('vibrate' in navigator) {
        try {
          const duration = style === 'light' ? 15 : style === 'medium' ? 35 : 60;
          navigator.vibrate(duration);
        } catch (e) {
          // ignore
        }
      }
    },
    notification: (type: 'success' | 'warning' | 'error') => {
      if ('vibrate' in navigator) {
        try {
          if (type === 'success') navigator.vibrate([30, 50, 30]);
          else if (type === 'warning') navigator.vibrate([50, 80, 50]);
          else if (type === 'error') navigator.vibrate([80, 50, 80, 50, 80]);
        } catch (e) {
          // ignore
        }
      }
    },
    selection: () => {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch (e) {
          // ignore
        }
      }
    }
  };

  /**
   * Native Share API (React Native Share equivalent)
   */
  public async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share failed:', err);
        }
        return false;
      }
    } else {
      // Fallback to clipboard
      if (data.url || data.text) {
        this.copyToClipboard(data.url || data.text || '');
      }
      return false;
    }
  }

  /**
   * Clipboard API (React Native Clipboard equivalent)
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      this.haptics.notification('success');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Biometric Authentication simulation (FaceID / TouchID / React Native LocalAuthentication)
   */
  public async authenticateBiometric(reason: string = 'Confirmer votre identité'): Promise<boolean> {
    this.haptics.impact('medium');
    
    // Simulate biometric prompt overlay or WebAuthn
    return new Promise((resolve) => {
      const confirmed = window.confirm(`[Biométrie Simulée / FaceID] ${reason}\n\nVoulez-vous autoriser cette action ?`);
      if (confirmed) {
        this.haptics.notification('success');
        resolve(true);
      } else {
        this.haptics.notification('error');
        resolve(false);
      }
    });
  }

  /**
   * Geolocation API (React Native Geolocation equivalent)
   */
  public getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  /**
   * Device Information (React Native DeviceInfo equivalent)
   */
  public getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    
    return {
      platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web',
      osVersion: isIOS ? '17.4' : isAndroid ? '14.0' : 'WebOS',
      model: isIOS ? 'iPhone 15 Pro' : isAndroid ? 'Pixel 8 Pro' : 'Browser View',
      isNative: false, // Running in AI Studio high-fidelity mobile container
      isDarkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    };
  }

  /**
   * Event emitter for native events
   */
  public addListener(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return () => {
      const list = this.listeners.get(event);
      if (list) {
        const index = list.indexOf(callback);
        if (index > -1) list.splice(index, 1);
      }
    };
  }

  private emit(event: string, data: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => cb(data));
    }
  }
}

export const nativeBridge = new NativeBridgeService();
