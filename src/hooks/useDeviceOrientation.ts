import { useState, useEffect } from 'react';
import { CameraFormat } from '../types/camera';

export interface OrientationState {
  orientation: 'portrait' | 'landscape';
  format: CameraFormat;
  angle: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isViewportLandscape: boolean;
  physicalFormat: CameraFormat;
}

export function useDeviceOrientation() {
  const measure = (): OrientationState => {
    const landscape = window.innerWidth > window.innerHeight;
    return { orientation: landscape ? 'landscape' : 'portrait',
      format: landscape ? 'horizontal' : 'vertical',
      angle: window.screen.orientation?.angle ?? 0,
      isLandscape: landscape, isPortrait: !landscape,
      isViewportLandscape: landscape, physicalFormat: landscape ? 'horizontal' : 'vertical' };
  };
  const [state, setState] = useState(measure);
  useEffect(() => {
    const update = () => setState(measure());
    const updateFromSensor = (event: DeviceOrientationEvent) => {
      if (event.gamma === null) return;
      const absoluteGamma = Math.abs(event.gamma);
      if (absoluteGamma > 48) {
        setState(previous => ({ ...previous, physicalFormat: 'horizontal',
          angle: event.gamma! > 0 ? 90 : -90 }));
      } else if (absoluteGamma < 28) {
        setState(previous => ({ ...previous, physicalFormat: 'vertical', angle: 0 }));
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
