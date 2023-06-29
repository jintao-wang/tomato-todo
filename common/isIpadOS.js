export const isIpadOS = () => {
    if (/iPad/.test(navigator.platform)) {
      return true;
    }
    return navigator.maxTouchPoints
    && navigator.maxTouchPoints > 2
    && /MacIntel/.test(navigator.platform);
  };
