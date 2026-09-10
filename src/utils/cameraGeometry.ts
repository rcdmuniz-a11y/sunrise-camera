import { CameraLens } from '../types/camera';

export const CAPTURE_WIDTH = 1080;
export const CAPTURE_HEIGHT = 1920;
export const CAPTURE_ASPECT = CAPTURE_WIDTH / CAPTURE_HEIGHT;

export interface VisibleVideoRegion {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

export interface FrameLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type FrameAnchor = 'bottom' | 'right' | 'top' | 'left';

export interface FrameState extends FrameLayout {
  anchor: FrameAnchor;
  asset: 'vertical' | 'horizontal';
}

export const zoomForLens = (lens: CameraLens): number => lens === '2x' ? 2 : lens === '3x' ? 3 : 1;

export const normalizeQuarterTurn = (angle: number) =>
  ((Math.round(angle / 90) * 90) % 360 + 360) % 360;

// Exact inverse of CSS object-fit: cover plus transform: scale(zoom).
export function calculateVisibleVideoRegion(
  videoWidth: number,
  videoHeight: number,
  stageWidth: number,
  stageHeight: number,
  zoom = 1,
  objectPositionX = 0.5,
  objectPositionY = 0.5,
): VisibleVideoRegion {
  if (videoWidth <= 0 || videoHeight <= 0 || stageWidth <= 0 || stageHeight <= 0) {
    throw new Error('La cámara todavía no está lista');
  }
  const safeZoom = Math.max(1, zoom);
  const coverScale = Math.max(stageWidth / videoWidth, stageHeight / videoHeight);
  const renderedScale = coverScale * safeZoom;
  const sourceWidth = Math.min(videoWidth, stageWidth / renderedScale);
  const sourceHeight = Math.min(videoHeight, stageHeight / renderedScale);
  return {
    sourceX: Math.max(0, (videoWidth - sourceWidth) * objectPositionX),
    sourceY: Math.max(0, (videoHeight - sourceHeight) * objectPositionY),
    sourceWidth,
    sourceHeight,
  };
}

export function calculateFrameLayout(
  stageWidth: number,
  stageHeight: number,
  orientation: number,
  imageAspect: number,
): FrameLayout {
  const angle = normalizeQuarterTurn(orientation);
  const horizontalEdge = angle === 90 || angle === 270;
  if (!horizontalEdge) {
    const width = stageWidth;
    const height = width / imageAspect;
    return {
      x: 0,
      y: angle === 180 ? 0 : stageHeight - height,
      width,
      height,
      rotation: angle,
    };
  }

  const width = stageHeight;
  const height = width / imageAspect;
  const rotatedWidth = height;
  const edgeX = angle === 90 ? stageWidth - rotatedWidth : 0;
  return {
    x: edgeX + (rotatedWidth - width) / 2,
    y: (stageHeight - height) / 2,
    width,
    height,
    rotation: angle,
  };
}

export function normalizeFrameLayout(layout: FrameLayout, stageWidth: number, stageHeight: number): FrameLayout {
  return {
    x: layout.x / stageWidth,
    y: layout.y / stageHeight,
    width: layout.width / stageWidth,
    height: layout.height / stageHeight,
    rotation: layout.rotation,
  };
}

const FRAME_ANGLES: Record<FrameAnchor, number> = {
  bottom: 0,
  right: 270,
  top: 180,
  left: 90,
};

export function getFrameState(anchor: FrameAnchor): FrameState {
  const rotation = FRAME_ANGLES[anchor];
  const asset = anchor === 'right' || anchor === 'left' ? 'horizontal' : 'vertical';
  const aspect = asset === 'horizontal' ? 1504 / 291 : 1213 / 459;
  // Side placement and side rotation are independent: the PNG's opaque base
  // must face the selected edge while its rotated bounding box stays anchored.
  const layoutAngle = anchor === 'left' ? 270 : anchor === 'right' ? 90 : rotation;
  const layout = normalizeFrameLayout(
    calculateFrameLayout(CAPTURE_WIDTH, CAPTURE_HEIGHT, layoutAngle, aspect),
    CAPTURE_WIDTH,
    CAPTURE_HEIGHT,
  );
  return { ...layout, rotation, anchor, asset };
}

export function drawVisibleVideoRegion(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  region: VisibleVideoRegion,
  outputWidth: number,
  outputHeight: number,
  mirror: boolean,
) {
  ctx.save();
  if (mirror) {
    ctx.translate(outputWidth, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, region.sourceX, region.sourceY, region.sourceWidth, region.sourceHeight,
    0, 0, outputWidth, outputHeight);
  ctx.restore();
}

export function drawNormalizedFrame(
  ctx: CanvasRenderingContext2D,
  frame: HTMLImageElement,
  layout: FrameLayout,
  outputWidth: number,
  outputHeight: number,
) {
  const x = layout.x * outputWidth;
  const y = layout.y * outputHeight;
  const width = layout.width * outputWidth;
  const height = layout.height * outputHeight;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(layout.rotation * Math.PI / 180);
  ctx.drawImage(frame, -width / 2, -height / 2, width, height);
  ctx.restore();
}

export function drawCameraSource(ctx: CanvasRenderingContext2D,
  source: CanvasImageSource, width: number, height: number,
  outputWidth: number, outputHeight: number, mirror: boolean, lens: CameraLens,
  zoom?: number) {
  const region = calculateVisibleVideoRegion(width, height, outputWidth, outputHeight,
    zoom ?? zoomForLens(lens));
  drawVisibleVideoRegion(ctx, source, region, outputWidth, outputHeight, mirror);
}

export function drawEventFrame(ctx: CanvasRenderingContext2D, frame: HTMLImageElement,
  width: number, height: number) {
  if (!frame.naturalWidth || !frame.naturalHeight) throw new Error('No se pudo cargar el marco');
  const scale = Math.min(width / frame.naturalWidth, height / frame.naturalHeight);
  const w = frame.naturalWidth * scale, h = frame.naturalHeight * scale;
  ctx.drawImage(frame, (width - w) / 2, height - h, w, h);
}
