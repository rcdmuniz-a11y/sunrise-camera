import { useState, useEffect } from 'react';
import { CameraFormat } from '../types/camera';

export interface OrientationState {
  orientation: 'portrait' | 'landscape';
  format: CameraFormat;
  angle: number;
  isLandscape: boolean;
  isPortrait: boolean;
}

// This hook controls layout only. Media orientation comes from video dimensions.
export function useDeviceOrientation() {
  const measure = (): OrientationState => {
    const landscape = window.innerWidth > window.innerHeight;
    return { orientation: landscape ? 'landscape' : 'portrait',
      format: landscape ? 'horizontal' : 'vertical', angle: window.screen.orientation?.angle || 0,
      isLandscape: landscape, isPortrait: !landscape };
  };
  const [state, setState] = useState(measure);
  useEffect(() => {
    const update = () => setState(measure());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return state;
}
