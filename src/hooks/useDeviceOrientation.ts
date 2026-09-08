import { useState, useEffect } from 'react';
import { CameraFormat } from '../types/camera';

export interface OrientationState {
  orientation: 'portrait' | 'landscape';
  format: CameraFormat;
  angle: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isUpsideDown: boolean;
  isViewportLandscape: boolean;
}

export function useDeviceOrientation() {
  const measure = (): OrientationState => {
    const screenType = window.screen.orientation?.type;
    const legacyAngle = typeof window.orientation === 'number' ? Number(window.orientation) : null;
    const landscape = screenType
      ? screenType.startsWith('landscape')
      : legacyAngle !== null
        ? Math.abs(legacyAngle) === 90
        : window.innerWidth > window.innerHeight;
    return { orientation: landscape ? 'landscape' : 'portrait',
      format: landscape ? 'horizontal' : 'vertical',
      angle: window.screen.orientation?.angle ?? legacyAngle ?? 0,
      isLandscape: landscape, isPortrait: !landscape, isUpsideDown: false,
      isViewportLandscape: window.innerWidth > window.innerHeight };
  };
  const [state, setState] = useState(measure);
  useEffect(() => {
    const update = () => setState(measure());
    const updateFromSensor = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      const absoluteGamma = Math.abs(event.gamma);
      if (absoluteGamma > 45) {
        setState({ orientation: 'landscape', format: 'horizontal',
          angle: event.gamma > 0 ? 90 : -90, isLandscape: true,
          isPortrait: false, isUpsideDown: false,
          isViewportLandscape: window.innerWidth > window.innerHeight });
      } else if (absoluteGamma < 30) {
        const upsideDown = event.beta < -45 && event.beta > -135;
        setState({ orientation: 'portrait', format: 'vertical',
          angle: upsideDown ? 180 : 0, isLandscape: false,
          isPortrait: true, isUpsideDown: upsideDown,
          isViewportLandscape: window.innerWidth > window.innerHeight });
      }
    };
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.screen.orientation?.addEventListener('change', update);
    window.addEventListener('deviceorientation', updateFromSensor, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.screen.orientation?.removeEventListener('change', update);
      window.removeEventListener('deviceorientation', updateFromSensor);
    };
  }, []);
  return state;
}
