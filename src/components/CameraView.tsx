import React, { useState, useEffect, useRef } from 'react';
import { CameraFormat, CameraLens } from '../types/camera';
import { zoomForLens } from '../utils/cameraGeometry';

interface CameraViewProps {
  facingMode: 'user' | 'environment';
  lens: CameraLens;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isScreenFlashing: boolean;
  countdown: number | null;
  isLandscape: boolean;
  onReady: (ready: boolean) => void;
  onFormat: (format: CameraFormat) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ facingMode, lens, videoRef,
  isScreenFlashing, countdown, onReady, onFormat, isLandscape }) => {
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [ratio, setRatio] = useState(3 / 4);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 1, height: 1 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setBounds({
      width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    const video = videoRef.current;
    onReady(false);
    setError(null);
    const updateSize = () => {
      if (cancelled || !video) return;
      const { videoWidth: w, videoHeight: h } = video;
      if (w && h) {
        setRatio(w / h);
        onFormat(w > h ? 'horizontal' : 'vertical');
        onReady(video.readyState >= 2);
      }
    };
    video?.addEventListener('resize', updateSize);
    video?.addEventListener('loadeddata', updateSize);
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Abre la aplicación con HTTPS o localhost para usar la cámara.');
        stream = await navigator.mediaDevices.getUserMedia({ audio: false,
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1440 } } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        if (video) { video.srcObject = stream; await video.play(); updateSize(); }
      } catch (err) {
        if (!cancelled) {
          onReady(false);
          setError(err instanceof Error && err.name === 'NotAllowedError'
            ? 'Permite el acceso a la cámara en tu navegador y vuelve a intentar.'
            : err instanceof Error ? err.message : 'No se pudo abrir la cámara.');
        }
      }
    }
    void start();
    return () => {
      cancelled = true;
      video?.removeEventListener('resize', updateSize);
      video?.removeEventListener('loadeddata', updateSize);
      stream?.getTracks().forEach(t => t.stop());
      if (video) video.srcObject = null;
    };
  }, [facingMode, retry, videoRef, onReady, onFormat]);

  const width = Math.min(bounds.width, bounds.height * ratio);
  return <div ref={containerRef} id="camera_viewport_container"
    className="absolute flex items-center justify-center bg-black overflow-hidden"
    style={{ left: 0, right: isLandscape ? 208 : 0, top: 64, bottom: isLandscape ? 0 : 224 }}>
    <div className="relative overflow-hidden" style={{ width, height: width / ratio }}>
      <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-contain"
        style={{ transform: `scaleX(${facingMode === 'user' ? -1 : 1}) scale(${zoomForLens(lens)})` }} />
    </div>
    {error && <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-950 text-white">
      <p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="rounded-xl bg-amber-400 px-5 py-3 text-black">Reintentar</button>
    </div>}
    {!error && <p className="absolute bottom-1 text-white/70 text-[11px] bg-black/60 rounded px-2">El marco se añade a la captura final</p>}
    {countdown !== null && <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-8xl font-bold">{countdown}</div>}
    {isScreenFlashing && <div className="absolute inset-0 bg-white" />}
  </div>;
};
