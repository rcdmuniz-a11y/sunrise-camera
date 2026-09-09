import React from 'react';
import { CameraLens, CameraMode } from '../types/camera';
import { Sparkles, Video as VideoIcon, Camera as CameraIcon } from 'lucide-react';

interface BottomControlsProps {
  cameraMode: CameraMode;
  onChangeCameraMode: (mode: CameraMode) => void;
  isRecording: boolean;
  recordingDuration: number;
  lens: CameraLens;
  onSelectLens: (lens: CameraLens) => void;
  facingMode: 'user' | 'environment';
  onCapture: () => void;
  isCapturing: boolean;
  lastPhotoThumb?: string;
  onOpenLastPhoto?: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  cameraMode,
  onChangeCameraMode,
  isRecording,
  recordingDuration,
  lens,
  onSelectLens,
  facingMode,
  onCapture,
  isCapturing,
  lastPhotoThumb,
  onOpenLastPhoto,
}) => {
  // Digital zoom crops the native camera feed consistently in every output.
  const availableLenses: CameraLens[] =
    facingMode === 'user' ? ['1x', '2x'] : ['1x', '2x', '3x'];
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <footer
      id="camera_bottom_controls"
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white select-none pointer-events-auto px-4"
      style={{
        paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 18px))',
        paddingLeft: 'max(12px, env(safe-area-inset-left, 12px))',
        paddingRight: 'max(12px, env(safe-area-inset-right, 12px))',
      }}
    >
      {/* 1. iPhone Zoom Lens Selector with 0.5x Plano Angular */}
      <div className="flex flex-col items-center mb-1.5">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-xl">
          {availableLenses.map((l) => {
            const isSelected = lens === l;
            return (
              <button
                key={l}
                id={`btn_lens_${l.replace('.', '_')}`}
                disabled={isRecording || isCapturing}
                onClick={() => onSelectLens(l)}
                title={`Zoom digital ${l}`}
                className={`flex items-center justify-center min-w-[34px] h-[34px] px-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-90 ${
                  isSelected
                    ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-400/50 scale-105 ring-1 ring-amber-300'
                    : 'text-white/80 hover:text-white hover:bg-white/15 disabled:opacity-50'
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. iOS-Style Camera Mode Switcher: FOTO | VIDEO */}
      <div className="flex items-center justify-center gap-6 mb-3 select-none">
        {isRecording ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white font-mono font-bold text-xs tracking-wider shadow-lg shadow-red-600/50 border border-red-400 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
            <span>GRABANDO {formatTime(recordingDuration)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-5 px-3 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-xs font-bold tracking-wider">
            <button
              id="btn_mode_foto"
              disabled={isCapturing}
              onClick={() => onChangeCameraMode('photo')}
              className={`transition-colors uppercase flex items-center gap-1.5 py-1 px-2.5 rounded-full ${
                cameraMode === 'photo'
                  ? 'text-amber-400 bg-white/10 font-extrabold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <CameraIcon size={13} />
              <span>Foto</span>
            </button>

            <button
              id="btn_mode_video"
              onClick={() => onChangeCameraMode('video')}
              className={`transition-colors uppercase flex items-center gap-1.5 py-1 px-2.5 rounded-full ${
                cameraMode === 'video'
                  ? 'text-red-400 bg-white/10 font-extrabold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <VideoIcon size={13} />
              <span>Video</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Primary Action Row: Gallery Thumbnail, Shutter Button, Timer */}
      <div className="w-full max-w-sm flex items-center justify-between gap-2">
        {/* Left: Last Photo Thumbnail */}
        <div className="w-14 flex items-center justify-start">
          {lastPhotoThumb ? (
            <button
              id="btn_gallery_thumbnail"
              onClick={onOpenLastPhoto}
              disabled={isRecording}
              title="Ver última captura"
              className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/60 shadow-lg active:scale-95 transition-transform disabled:opacity-40"
            >
              <img
                src={lastPhotoThumb}
                alt="Miniatura"
                className="w-full h-full object-cover"
              />
            </button>
          ) : (
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-500">
              <Sparkles size={16} />
            </div>
          )}
        </div>

        {/* Center: Large Shutter Button (Adaptive for Photo vs Video) */}
        <div className="flex flex-col items-center">
          {cameraMode === 'photo' ? (
            <button
              id="btn_shutter_capture"
              onClick={onCapture}
              disabled={isCapturing}
              title="Tomar fotografía con marco Sunrise"
              className="group relative flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-white active:scale-95 transition-transform duration-150 focus:outline-hidden disabled:opacity-50 shadow-2xl"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-200 ${
                  isCapturing
                    ? 'bg-amber-500 scale-75 animate-ping'
                    : 'bg-white group-hover:bg-amber-100 group-active:scale-90'
                }`}
              />
            </button>
          ) : (
            /* Video Mode Shutter */
            <button
              id="btn_video_record_toggle"
              onClick={onCapture}
              disabled={isCapturing && !isRecording}
              title={isRecording ? 'Detener grabación de video' : 'Iniciar grabación de video'}
              className={`group relative flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 transition-all duration-200 focus:outline-hidden active:scale-95 shadow-2xl ${
                isRecording ? 'border-red-500 animate-pulse' : 'border-white'
              }`}
            >
              {isRecording ? (
                /* Recording Stop Square */
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 shadow-md shadow-red-500/50 transition-all active:scale-90" />
              ) : (
                /* Ready to Record Red Circle */
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 group-hover:bg-red-500 shadow-md shadow-red-600/50 transition-all active:scale-90" />
              )}
            </button>
          )}
        </div>

        {/* Right spacer keeps the shutter centered */}
        <div className="w-14 flex items-center justify-end">
        </div>
      </div>
    </footer>
  );
};
