import React, { useState } from 'react';
import { CapturedPhoto } from '../types/camera';
import { saveOrSharePhoto } from '../utils/photoComposer';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  X,
  FileCheck
} from 'lucide-react';

interface PhotoPreviewProps {
  photo: CapturedPhoto;
  onClose: () => void;
  onRetake: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewProps> = ({
  photo,
  onClose,
  onRetake,
}) => {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveOrSharePhoto(photo);
      setSaveStatus(res.message);
    } catch {
      setSaveStatus('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="photo_preview_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95dvh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wider">
                {photo.filename}
              </h2>
              <p className="text-[11px] text-slate-400">
                Foto {photo.format === 'vertical' ? 'vertical' : 'horizontal'}
              </p>
            </div>
          </div>

          <button
            id="btn_close_preview"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center p-3 min-h-0">
          <img
            src={photo.dataUrl}
            alt={photo.filename}
            className="max-h-[55dvh] max-w-full w-auto object-contain rounded-xl shadow-xl"
          />

          {/* Success toast notification */}
          {saveStatus && (
            <div className="absolute top-6 px-4 py-2 rounded-full bg-emerald-600/90 text-white font-medium text-xs shadow-xl flex items-center gap-2 border border-emerald-400 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={16} />
              <span>{saveStatus}</span>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-5 border-t border-white/10 bg-slate-950/90 flex flex-col gap-3">
          {/* Main Action: Save to Photos / Share */}
          <button
            id="btn_save_to_photos"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Download size={20} className="stroke-[2.5]" />
                <span>Guardar foto</span>
              </>
            )}
          </button>

          {/* Secondary Actions: Retake and Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              id="btn_retake_photo"
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Tomar otra foto</span>
            </button>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <FileCheck size={14} className="text-emerald-400" />
              <span>Formato JPEG Alta Resolución</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
