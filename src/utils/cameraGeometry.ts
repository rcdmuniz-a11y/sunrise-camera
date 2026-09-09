import { CameraLens } from '../types/camera';

export const zoomForLens = (lens: CameraLens): number => lens === '2x' ? 2 : lens === '3x' ? 3 : 1;

// Preserve the camera's own pixel orientation and aspect ratio. A viewport
// mismatch is not evidence that the browser supplied rotated pixels.
export function sourceCrop(width: number, height: number, outputWidth: number,
  outputHeight: number, zoom: number) {
  const sourceRatio = width / height;
  const outputRatio = outputWidth / outputHeight;
  let cropWidth = width;
  let cropHeight = height;
  if (sourceRatio > outputRatio) cropWidth = height * outputRatio;
  else cropHeight = width / outputRatio;
  cropWidth /= zoom;
  cropHeight /= zoom;
  return { x: (width - cropWidth) / 2, y: (height - cropHeight) / 2,
    width: cropWidth, height: cropHeight };
}

export function drawCameraSource(ctx: CanvasRenderingContext2D,
  source: CanvasImageSource, width: number, height: number,
  outputWidth: number, outputHeight: number, mirror: boolean, lens: CameraLens,
  zoom?: number, rotation = 0) {
  const requestedZoom = zoom ?? zoomForLens(lens);
  const quarterTurn = Math.abs(rotation) === 90;
  const effectiveWidth = quarterTurn ? height : width;
  const effectiveHeight = quarterTurn ? width : height;
  // Fit the complete sensor image inside the fixed export. Using the larger
  // scale here would fill the canvas by throwing away parts of the photograph.
  const scale = Math.min(outputWidth / effectiveWidth, outputHeight / effectiveHeight) * requestedZoom;
  ctx.save();
  ctx.translate(outputWidth / 2, outputHeight / 2);
  if (rotation) ctx.rotate(rotation * Math.PI / 180);
  ctx.scale(mirror ? -scale : scale, scale);
  ctx.drawImage(source, -width / 2, -height / 2, width, height);
  ctx.restore();
}

export function drawEventFrame(ctx: CanvasRenderingContext2D, frame: HTMLImageElement,
  width: number, height: number) {
  if (!frame.naturalWidth || !frame.naturalHeight) throw new Error('No se pudo cargar el marco');
  const scale = Math.min(width / frame.naturalWidth, height / frame.naturalHeight);
  const w = frame.naturalWidth * scale, h = frame.naturalHeight * scale;
  ctx.drawImage(frame, (width - w) / 2, height - h, w, h);
}
