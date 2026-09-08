import React, { useState, useEffect, useRef } from 'react';
import { CameraFormat, CaptureSize } from '../types/camera';

interface CameraViewProps {
  facingMode: 'user' | 'environment';
  zoom: number;
  onZoomChange: (zoom: number) => void;
  rotation: number;
  captureSize: CaptureSize;
  physicalFormat: CameraFormat;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onReady: (ready: boolean) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ facingMode, zoom, onZoomChange, rotation,
  captureSize, physicalFormat, videoRef,
  onReady }) => {
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);

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
  }, [facingMode, retry, videoRef, onReady]);

  const touchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };
  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      pinchRef.current = { distance: touchDistance(event.touches), zoom };
    }
  };
  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length !== 2 || !pinchRef.current) return;
    event.preventDefault();
    const maxZoom = facingMode === 'user' ? 2 : 3;
    const next = pinchRef.current.zoom * touchDistance(event.touches) / pinchRef.current.distance;
    onZoomChange(Math.min(maxZoom, Math.max(1, Math.round(next * 10) / 10)));
  };
  const handleTouchEnd = () => { pinchRef.current = null; };
  const selectedAspect = captureSize === 'square' ? 1
    : captureSize === 'classic'
      ? physicalFormat === 'horizontal' ? 4 / 3 : 3 / 4
      : physicalFormat === 'horizontal' ? 16 / 9 : 9 / 16;
  const viewportAspect = typeof window === 'undefined' ? 9 / 16 : window.innerWidth / window.innerHeight;
  const quarterTurnScale = Math.abs(rotation) === 90 ? Math.max(viewportAspect, 1 / viewportAspect) : 1;

  return <div id="camera_viewport_container"
    className="absolute flex items-center justify-center bg-black overflow-hidden"
    onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    style={{ inset: 0, touchAction: 'none' }}>
    <div className="relative overflow-hidden w-full h-full">
      <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover"
        style={{ transform: `rotate(${rotation}deg) scaleX(${facingMode === 'user' ? -1 : 1}) scale(${zoom * quarterTurnScale})` }} />
      <span className="absolute top-20 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-300 pointer-events-none">
        {zoom.toFixed(1)}×
      </span>
      <div className="absolute inset-3 pointer-events-none flex items-center justify-center">
        <div className="max-w-full max-h-full border border-white/55 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.08)]"
          style={{ aspectRatio: selectedAspect, width: selectedAspect >= 1 ? '94%' : 'auto',
            height: selectedAspect < 1 ? '94%' : 'auto' }} />
      </div>
    </div>
    {error && <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-950 text-white">
      <p>{error}</p><button onClick={() => setRetry(n => n + 1)} className="rounded-xl bg-amber-400 px-5 py-3 text-black">Reintentar</button>
    </div>}
  </div>;
};
