import React from 'react';
import { EventSettings } from '../types/camera';
import {
  Hash,
  FileText,
  RotateCcw,
  X,
  Settings,
} from 'lucide-react';

interface EventSettingsProps {
  settings: EventSettings;
  onUpdateSettings: (newSettings: Partial<EventSettings>) => void;
  onResetCounter: () => void;
  onClose: () => void;
}

export const EventSettingsModal: React.FC<EventSettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetCounter,
  onClose,
}) => {
  return (
    <div
      id="event_settings_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              Configuración de Evento
            </h2>
          </div>
          <button
            id="btn_close_settings"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Photo Counter */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <Hash size={13} className="text-amber-400" />
                <span>Contador de Fotos</span>
              </div>
              <div className="text-xl font-mono font-black text-white mt-0.5">
                #{settings.photoCounter}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {settings.filePrefix}{String(settings.photoCounter).padStart(3, '0')}.jpg
              </div>
            </div>

            <button
              id="btn_reset_counter"
              onClick={() => {
                onResetCounter();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-rose-300 border border-rose-500/30 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* File Prefix */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <FileText size={13} className="text-amber-400" />
              <span>Prefijo de Archivo</span>
            </label>
            <input
              id="input_file_prefix"
              type="text"
              value={settings.filePrefix}
              onChange={(e) => onUpdateSettings({ filePrefix: e.target.value.toUpperCase() })}
              placeholder="SUNRISE_"
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-white/20 text-white font-mono text-sm focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md mt-2"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
