export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' = 'medium') {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(15);
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'selection':
          navigator.vibrate(10);
          break;
      }
    } catch (e) {
      // Ignore vibration errors on unsupported browsers/devices
    }
  }
}
