// Web Haptics Utility following Apple Design Multimodal Feedback principles

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning';

export const triggerHaptic = (type: HapticType = 'light') => {
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(35);
        break;
      case 'success':
        navigator.vibrate([15, 40, 20]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30, 50]);
        break;
    }
  } catch (e) {
    // Ignore if blocked by user interaction gesture policy
  }
};
