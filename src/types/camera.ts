export type CameraFormat = 'vertical' | 'horizontal';

export type CaptureSize = 'full' | 'classic' | 'square';

export type CameraMode = 'photo' | 'video';

export type CameraLens = '0.5x' | '1x' | '2x' | '3x';

export type FilterId = 'original' | 'vivo' | 'calido' | 'frio' | 'bn' | 'contraste_alto';

export interface CameraFilter {
  id: FilterId;
  name: string;
  subtitle: string;
  cssFilter: string;
  description: string;
  coreImageFilter: string; // Corresponding Core Image filter code
}

export interface CapturedPhoto {
  id: string;
  filename: string;
  dataUrl: string;
  blob: Blob;
  format: CameraFormat;
  filterId: FilterId;
  filterName: string;
  timestamp: Date;
  lens: CameraLens;
  width: number;
  height: number;
}

export interface CapturedVideo {
  id: string;
  filename: string;
  blobUrl: string;
  blob: Blob;
  format: CameraFormat;
  filterId: FilterId;
  filterName: string;
  timestamp: Date;
  lens: CameraLens;
  durationSeconds: number;
}

export interface EventSettings {
  eventName: string;
  photoCounter: number;
  filePrefix: string;
  isKioskLocked: boolean;
  adminPin: string;
  quickLaunchFormat: CameraFormat | 'ask' | 'auto';
  timerSeconds: number;
  flashMode: 'off' | 'on' | 'auto';
  autoSaveToPhotos: boolean;
}

export interface FrameAsset {
  format: CameraFormat;
  name: string;
  dataUrl: string;
  aspectRatio: string;
  width: number;
  height: number;
  isCustom: boolean;
}

export interface SwiftFileItem {
  filename: string;
  path: string;
  category: 'App' | 'Views' | 'ViewModels' | 'Processing' | 'Services' | 'Config' | 'Documentation';
  description: string;
  content: string;
}
