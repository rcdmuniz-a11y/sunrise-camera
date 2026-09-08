import { useState, useEffect } from 'react';
import { CameraFormat } from '../types/camera';

export interface OrientationState {
  orientation: 'portrait' | 'landscape';
  format: CameraFormat;
  angle: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isViewportLandscape: boolean;
}

export function useDeviceOrientation() {
  const measure = (): OrientationState => {
    const landscape = window.innerWidth > window.innerHeight;
    return { orientation: landscape ? 'landscape' : 'portrait',
      format: landscape ? 'horizontal' : 'vertical',
      angle: window.screen.orientation?.angle ?? 0,
      isLandscape: landscape, isPortrait: !landscape,
      isViewportLandscape: landscape };
  };
  const [state, setState] = useState(measure);
  useEffect(() => {
    const update = () => setState(measure());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.screen.orientation?.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.screen.orientation?.removeEventListener('change', update);
    };
  }, []);
  return state;
}
