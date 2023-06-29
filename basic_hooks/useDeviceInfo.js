import { useEffect } from 'react';
import { BREAK_POINTS } from '@/enum/BreakPoints';
import useStore from '../store';

export default function useDeviceInfo() {
  const [, updateDeviceInfo] = useStore.deviceInfo();

  useEffect(() => {
    const deviceInfo = {
      size: 'checking', // 'extraSmall'(<600), 'small'(600-768), 'medium'(768-992), 'large'(992-1200), 'extraLarge'(>1200)
      type: 'checking', // 'checking' 'desktop' 'tablet' 'mobile'
      isTouchDevice: 'checking', // false, true
      px: 'checking',
    };

    const ua = navigator.userAgent;

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      deviceInfo.type = 'tablet';
    } else if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua,
      )
    ) {
      deviceInfo.type = 'mobile';
    } else if (navigator.maxTouchPoints
      && navigator.maxTouchPoints > 2
      && /MacIntel/.test(navigator.platform)) {
      deviceInfo.type = 'tablet';
    } else {
      deviceInfo.type = 'desktop';
    }

    deviceInfo.isTouchDevice = 'ontouchstart' in document.documentElement;

    if (window.innerWidth < BREAK_POINTS.sm) {
      deviceInfo.size = 'sm';
    } else if (window.innerWidth < BREAK_POINTS.md) {
      deviceInfo.size = 'md';
    } else if (window.innerWidth < BREAK_POINTS.lg) {
      deviceInfo.size = 'lg';
    } else if (window.innerWidth < BREAK_POINTS.xl) {
      deviceInfo.size = 'xl';
    } else {
      deviceInfo.size = 'xxl';
    }

    deviceInfo.px = window.innerWidth;

    updateDeviceInfo((draftRef) => {
      draftRef.current = deviceInfo;
    });

    const handleWindowResize = () => {
      if (window.innerWidth < BREAK_POINTS.sm) {
        updateDeviceInfo((draftRef) => {
          draftRef.current.size = 'sm';
        });
      } else if (window.innerWidth < BREAK_POINTS.md) {
        updateDeviceInfo((draftRef) => {
          draftRef.current.size = 'md';
        });
      } else if (window.innerWidth < BREAK_POINTS.lg) {
        updateDeviceInfo((draftRef) => {
          draftRef.current.size = 'lg';
        });
      } else if (window.innerWidth < BREAK_POINTS.xl) {
        updateDeviceInfo((draftRef) => {
          draftRef.current.size = 'xl';
        });
      } else {
        updateDeviceInfo((draftRef) => {
          draftRef.current.size = 'xxl';
        });
      }
      updateDeviceInfo((draftRef) => {
        draftRef.current.px = window.innerWidth;
      });
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
}
