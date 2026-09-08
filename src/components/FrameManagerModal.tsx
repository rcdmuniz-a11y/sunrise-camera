import React, { useRef } from 'react';
import { CameraFormat, FrameAsset } from '../types/camera';
import {
  Upload,
  RotateCcw,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Layers
} from 'lucide-react';

interface FrameManagerProps {
  verticalFrame: FrameAsset;
  horizontalFrame: FrameAsset;
  onUpdateFrame: (format: CameraFormat, dataUrl: string, name: string) => void;
  onResetFrame: (format: CameraFormat) => void;
  onClose: () => void;
}

export const FrameManagerModal: React.FC<FrameManagerProps> = ({
  verticalFrame,
  horizontalFrame,
  onUpdateFrame,
  onResetFrame,
  onClose,
}) => {
  const vInputRef = useRef<HTMLInputElement>(null);
  const hInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    format: CameraFormat
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateFrame(format, dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadFrame = (frame: FrameAsset) => {
    const a = document.createElement('a');
    a.href = frame.dataUrl;
    a.download = `${frame.name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="frame_manager_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Gestión de Marcos Oficiales
              </h2>
              <p className="text-xs text-slate-400">
                Reemplaza los marcos PNG de futuros eventos sin tocar una sola línea de código
              </p>
            </div>
          </div>

          <button
            id="btn_close_frame_manager"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Frame 1: Marco Vertical.png */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-5 items-center">
            {/* Visual Thumbnail */}
            <div className="relative w-28 h-48 bg-slate-900 rounded-xl overflow-hidden border border-white/20 flex items-center justify-center shrink-0">
              <img
                src={verticalFrame.dataUrl}
                alt="Marco Vertical"
                className="w-full h-full object-contain object-bottom"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-mono text-amber-300">
                9:16
              </span>
            </div>

            {/* Info and Actions */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-sm font-mono font-bold text-white">
                  Marco Vertical.png
                </span>
                {verticalFrame.isCustom ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold">
                    Personalizado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-500/40 text-[10px] font-semibold">
                    Oficial Sunrise 3.0
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Proporción recomendada: 1080 × 1920 px. PNG transparente con zona superior libre para la cámara.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                <input
                  ref={vInputRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'vertical')}
                />
                <button
                  id="btn_upload_vertical_frame"
                  onClick={() => vInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-colors"
                >
                  <Upload size={14} />
                  <span>Subir nuevo PNG</span>
                </button>

                <button
                  id="btn_download_vertical_frame"
                  onClick={() => downloadFrame(verticalFrame)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs transition-colors"
                >
                  <Download size={14} />
                  <span>Descargar</span>
                </button>

                {verticalFrame.isCustom && (
                  <button
                    id="btn_reset_vertical_frame"
                    onClick={() => onResetFrame('vertical')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs transition-colors"
                  >
                    <RotateCcw size={14} />
                    <span>Restaurar Oficial</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Frame 2: Marco Horizontal.png */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-5 items-center">
            {/* Visual Thumbnail */}
            <div className="relative w-44 h-28 bg-slate-900 rounded-xl overflow-hidden border border-white/20 flex items-center justify-center shrink-0">
              <img
                src={horizontalFrame.dataUrl}
                alt="Marco Horizontal"
                className="w-full h-full object-contain object-bottom"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-mono text-cyan-300">
                16:9
              </span>
            </div>

            {/* Info and Actions */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-sm font-mono font-bold text-white">
                  Marco Horizontal.png
                </span>
                {horizontalFrame.isCustom ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold">
                    Personalizado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-500/40 text-[10px] font-semibold">
                    Oficial Sunrise 3.0
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Proporción recomendada: 1920 × 1080 px. PNG transparente con banner inferior de Guardianes del Mar.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                <input
                  ref={hInputRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'horizontal')}
                />
                <button
                  id="btn_upload_horizontal_frame"
                  onClick={() => hInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Upload size={14} />
                  <span>Subir nuevo PNG</span>
                </button>

                <button
                  id="btn_download_horizontal_frame"
                  onClick={() => downloadFrame(horizontalFrame)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs transition-colors"
                >
                  <Download size={14} />
                  <span>Descargar</span>
                </button>

                {horizontalFrame.isCustom && (
                  <button
                    id="btn_reset_horizontal_frame"
                    onClick={() => onResetFrame('horizontal')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs transition-colors"
                  >
                    <RotateCcw size={14} />
                    <span>Restaurar Oficial</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* iOS / Xcode Dynamic Replacement Guide */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <CheckCircle2 size={16} className="text-blue-400" />
              <span>¿Cómo funciona el cambio en el iPhone sin recompilar?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              El motor Swift implementa <code className="text-amber-300 font-mono">FrameFileManager.swift</code>.
              Esto permite que en el evento puedas reemplazar los archivos PNG directamente en la carpeta <strong>Documents/Frames</strong> usando AirDrop, la app Archivos de iOS, o este panel sin necesidad de volver a compilar en Xcode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
