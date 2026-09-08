import { CameraLens } from '../types/camera';

export const zoomForLens = (lens: CameraLens): number => lens === '2x' ? 2 : lens === '3x' ? 3 : 1;

// Preserve the camera's own pixel orientation and aspect ratio. A viewport
// mismatch is not evidence that the browser supplied rotated pixels.
export function sourceCrop(width: number, height: number, lens: CameraLens) {
  const zoom = zoomForLens(lens);
  return { x: (width - width / zoom) / 2, y: (height - height / zoom) / 2,
    width: width / zoom, height: height / zoom };
}

export function drawCameraSource(ctx: CanvasRenderingContext2D,
  source: CanvasImageSource, width: number, height: number,
  outputWidth: number, outputHeight: number, mirror: boolean, lens: CameraLens) {
  const crop = sourceCrop(width, height, lens);
  ctx.save();
  if (mirror) { ctx.translate(outputWidth, 0); ctx.scale(-1, 1); }
  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, outputWidth, outputHeight);
  ctx.restore();
}

export function drawEventFrame(ctx: CanvasRenderingContext2D, frame: HTMLImageElement,
  width: number, height: number) {
  if (!frame.naturalWidth || !frame.naturalHeight) throw new Error('No se pudo cargar el marco');
  const scale = Math.min(width / frame.naturalWidth, height / frame.naturalHeight);
  const w = frame.naturalWidth * scale, h = frame.naturalHeight * scale;
  ctx.drawImage(frame, (width - w) / 2, height - h, w, h);
}
