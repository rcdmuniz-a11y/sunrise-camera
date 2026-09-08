import React from 'react';
import { CameraFormat } from '../types/camera';
import { Smartphone, Monitor, ShieldCheck, Sparkles } from 'lucide-react';

interface FormatSelectionProps {
  onSelectFormat: (format: CameraFormat) => void;
  photoCount: number;
  onOpenSettings?: () => void;
}

export const FormatSelectionModal: React.FC<FormatSelectionProps> = ({
  onSelectFormat,
  photoCount,
  onOpenSettings,
}) => {
  return (
    <div
      id="format_selection_screen"
      className="relative flex flex-col justify-between items-center min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-10 select-none"
    >
      {/* Background visual water shimmer effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600 blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
      </div>

      {/* Header section */}
      <div className="relative z-10 flex flex-col items-center text-center mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-sm">
          <Sparkles size={14} className="text-amber-400" />
          Edición Oficial • Guardianes del Mar
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span className="text-amber-400">SUNRISE</span>
          <span className="text-white text-3xl sm:text-4xl font-extrabold bg-blue-700/60 px-3 py-0.5 rounded-xl border border-blue-400/40">3.0</span>
        </h1>
        <p className="text-xs sm:text-sm font-mono tracking-widest text-slate-400 uppercase mt-2">
          Cámara Profesional de Eventos
        </p>
      </div>

      {/* Main selection cards */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-5 my-auto">
        <div className="text-center">
          <p className="text-base sm:text-lg font-medium text-slate-200 mb-1">
            Selecciona formato:
          </p>
          <p className="text-xs text-slate-400">
            Cada formato carga automáticamente su marco oficial correspondiente
          </p>
        </div>

        {/* [ VERTICAL ] Button */}
        <button
          id="btn_select_vertical"
          onClick={() => onSelectFormat('vertical')}
          className="group relative w-full p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 active:scale-98 transition-all duration-200 border border-amber-300/40 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white">
              <Smartphone size={28} className="rotate-0" />
            </div>
            <div className="text-left">
              <div className="text-lg sm:text-xl font-mono font-black tracking-wider">
                [ VERTICAL ]
              </div>
              <div className="text-xs text-amber-100 font-medium mt-0.5">
                Marco Vertical.png (9:16 Story)
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-black/30 border border-white/20">
            Retrato
          </div>
        </button>

        {/* [ HORIZONTAL ] Button */}
        <button
          id="btn_select_horizontal"
          onClick={() => onSelectFormat('horizontal')}
          className="group relative w-full p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-700 text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/35 active:scale-98 transition-all duration-200 border border-blue-300/40 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white">
              <Monitor size={28} />
            </div>
            <div className="text-left">
              <div className="text-lg sm:text-xl font-mono font-black tracking-wider">
                [ HORIZONTAL ]
              </div>
              <div className="text-xs text-cyan-100 font-medium mt-0.5">
                Marco Horizontal.png (16:9 Banner)
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-black/30 border border-white/20">
            Paisaje
          </div>
        </button>
      </div>

      {/* Footer information */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Fotos del evento: <strong className="text-white font-mono">{photoCount}</strong></span>
        </div>

        {onOpenSettings && (
          <button
            id="btn_open_settings_landing"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors p-1"
          >
            <ShieldCheck size={16} />
            <span>Configuración</span>
          </button>
        )}
      </div>
    </div>
  );
};
