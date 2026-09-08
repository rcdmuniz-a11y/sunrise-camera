import React from 'react';
import {
  SwitchCamera,
  Zap,
  ZapOff,
  Settings,
} from 'lucide-react';

interface TopBarProps {
  onSwitchCamera: () => void;
  flashMode: 'off' | 'on' | 'auto';
  onCycleFlash: () => void;
  photoCount: number;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSwitchCamera,
  flashMode,
  onCycleFlash,
  photoCount,
  onOpenSettings,
}) => {
  return (
    <header
      id="camera_top_bar"
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-5 pb-3 bg-gradient-to-b from-black/85 via-black/45 to-transparent text-white select-none pointer-events-auto"
      style={{
        paddingTop: 'max(14px, env(safe-area-inset-top, 14px))',
        paddingLeft: 'max(12px, env(safe-area-inset-left, 12px))',
        paddingRight: 'max(12px, env(safe-area-inset-right, 12px))',
      }}
    >
      {/* Center: Event Branding */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono backdrop-blur-md">
        <span className="text-amber-400 font-bold">SUNRISE</span>
        <span className="text-slate-400">#{photoCount}</span>
      </div>

      {/* Right: Camera Flip, Flash, Settings */}
      <div className="flex items-center gap-2">
        {/* Flash */}
        <button
          id="btn_flash_toggle"
          onClick={onCycleFlash}
          title={`Flash: ${flashMode.toUpperCase()}`}
          className={`p-2 rounded-full border transition-all active:scale-95 ${
            flashMode === 'on'
              ? 'bg-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/30'
              : 'bg-black/60 text-white/80 border-white/20 hover:bg-black/80'
          }`}
        >
          {flashMode === 'off' ? <ZapOff size={16} /> : <Zap size={16} />}
        </button>

        {/* Flip camera */}
        <button
          id="btn_flip_camera"
          onClick={onSwitchCamera}
          title="Cambiar cámara frontal / trasera"
          className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white active:scale-95 transition-all"
        >
          <SwitchCamera size={16} />
        </button>

        {/* Settings */}
        <button
          id="btn_open_settings"
          onClick={onOpenSettings}
          title="Configuración"
          className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
