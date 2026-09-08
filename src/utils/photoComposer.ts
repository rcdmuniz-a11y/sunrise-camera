import { CapturedPhoto, CameraLens } from '../types/camera';
import { CameraFormat } from '../types/camera';
import { drawCameraSource, drawEventFrame } from './cameraGeometry';

interface ComposeOptions {
  videoElement?: HTMLVideoElement | null;
  imageElement?: HTMLImageElement | null;
  frames: { vertical: string; horizontal: string };
  counter: number;
  filePrefix: string;
  facingMode?: 'user' | 'environment';
  lens?: CameraLens;
  format: CameraFormat;
  zoom?: number;
}

export async function composeHighResPhoto(options: ComposeOptions): Promise<CapturedPhoto> {
  const { videoElement, imageElement, frames, counter, filePrefix, format,
    facingMode = 'environment', lens = '1x', zoom = 1 } = options;
  const source = videoElement && videoElement.readyState >= 2 ? videoElement : imageElement;
  const width = source instanceof HTMLVideoElement ? source.videoWidth : source?.naturalWidth || 0;
  const height = source instanceof HTMLVideoElement ? source.videoHeight : source?.naturalHeight || 0;
  if (!source || !width || !height) throw new Error('La cámara todavía no está lista. Vuelve a intentar.');
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);
  const outputWidth = format === 'vertical' ? shortSide : longSide;
  const outputHeight = format === 'vertical' ? longSide : shortSide;
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth; canvas.height = outputHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('No se pudo preparar la foto');
  // Freeze the photograph before loading branding, so movement cannot change it.
  drawCameraSource(ctx, source, width, height, outputWidth, outputHeight,
    facingMode === 'user', lens, zoom);
  const frame = new Image();
  await new Promise<void>((resolve, reject) => {
    frame.onload = () => resolve();
    frame.onerror = () => reject(new Error('No se pudo cargar el marco de la foto'));
    frame.src = frames[format];
  });
  drawEventFrame(ctx, frame, outputWidth, outputHeight);
  const index = String(counter).padStart(3, '0');
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
    value => value ? resolve(value) : reject(new Error('No se pudo exportar la foto')), 'image/jpeg', 0.95));
  return { id: `photo_${Date.now()}_${index}`, filename: `${filePrefix}${index}.jpg`,
    dataUrl: canvas.toDataURL('image/jpeg', 0.95), blob, format, filterId: 'original',
    filterName: 'Original', timestamp: new Date(), lens, width: outputWidth, height: outputHeight };
}

export async function saveOrSharePhoto(photo: CapturedPhoto): Promise<{ savedDirectly: boolean; message: string }> {
  const file = new File([photo.blob], photo.filename, { type: 'image/jpeg' });

  // On iOS Safari / iPhone Web, navigator.canShare with files triggers the native Share Sheet,
  // allowing the user to tap "Guardar imagen" to put it straight into Apple Photos!
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: photo.filename,
        text: 'Fotografía oficial Sunrise 3.0 Guardianes del Mar'
      });
      return { savedDirectly: true, message: 'Compartido / Guardado en Fotos' };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { savedDirectly: false, message: 'Cancelado por usuario' };
      }
      // Fallback to direct anchor download
    }
  }

  // Standard web download fallback
  const a = document.createElement('a');
  a.href = photo.dataUrl;
  a.download = photo.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return { savedDirectly: true, message: `Descargado como ${photo.filename}` };
}
