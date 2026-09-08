import React, { useState } from 'react';
import { CapturedVideo } from '../types/camera';
import {
  Download,
  Share2,
  RotateCcw,
  CheckCircle2,
  Video as VideoIcon,
  X,
  FileCheck
} from 'lucide-react';

interface VideoPreviewProps {
  video: CapturedVideo;
  onClose: () => void;
  onRetake: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewProps> = ({
  video,
  onClose,
  onRetake,
}) => {
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // If Web Share API supports file sharing
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [
            new File([video.blob], video.filename, {
              type: video.blob.type || 'video/mp4',
            }),
          ],
        })
      ) {
        const file = new File([video.blob], video.filename, {
          type: video.blob.type || 'video/mp4',
        });
        await navigator.share({
          files: [file],
          title: video.filename,
          text: 'Video oficial de Sunrise 3.0',
        });
        setSaveStatus('¡Compartido con éxito!');
      } else {
        // Fallback: direct download link
        const a = document.createElement('a');
        a.href = video.blobUrl;
        a.download = video.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setSaveStatus('¡Video descargado!');
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        const a = document.createElement('a');
        a.href = video.blobUrl;
        a.download = video.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setSaveStatus('¡Video descargado!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      id="video_preview_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <VideoIcon size={18} className="text-red-500" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-wider">
                {video.filename}
              </h2>
              <p className="text-[11px] text-slate-400">
                Duración: {formatSeconds(video.durationSeconds)} • Lente {video.lens}
              </p>
            </div>
          </div>

          <button
            id="btn_close_video_preview"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player Preview */}
        <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center p-3 min-h-[340px]">
          <video
            src={video.blobUrl}
            controls
            playsInline
            autoPlay
            loop
            className={`max-h-[60vh] w-auto object-contain rounded-xl shadow-xl ${
              video.format === 'vertical' ? 'aspect-[9/16]' : 'aspect-[16/9]'
            }`}
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
          {/* Main Action: Save Video / Share */}
          <button
            id="btn_save_video"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 hover:from-red-400 hover:to-rose-500 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-red-500/25 active:scale-98 transition-all"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Download size={20} className="stroke-[2.5]" />
                <span>Guardar Video / Compartir</span>
                <Share2 size={16} className="text-white/80" />
              </>
            )}
          </button>

          {/* Secondary Actions: Retake and Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              id="btn_retake_video"
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Grabar otro video</span>
            </button>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <FileCheck size={14} className="text-emerald-400" />
              <span>Marco Sunrise 3.0 Integrado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
