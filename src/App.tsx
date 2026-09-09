import { useState, useRef, useEffect } from 'react';
import {
  CapturedPhoto,
  EventSettings,
  CameraLens,
  CameraMode,
  CapturedVideo,
} from './types/camera';
import marcoVerticalPng from './Marco Vertical.png';
import marcoHorizontalPng from './Marco Horizontal.png';
import {
  playShutterSound,
  playRecordStartSound,
  playRecordStopSound,
} from './utils/audioEffects';
import { composeHighResPhoto } from './utils/photoComposer';
import { videoRecorder } from './utils/videoRecorder';
import { TopBar } from './components/TopBar';
import { CameraView } from './components/CameraView';
import { BottomControls } from './components/BottomControls';
import { PhotoPreviewModal } from './components/PhotoPreviewModal';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { useDeviceOrientation } from './hooks/useDeviceOrientation';
import {
  calculateFrameLayout,
  calculateVisibleVideoRegion,
  normalizeFrameLayout,
  normalizeQuarterTurn,
} from './utils/cameraGeometry';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  SETTINGS: 'sunrise_camera_settings_v3',
};

const DEFAULT_SETTINGS: EventSettings = {
  eventName: 'Sunrise 3.0',
  photoCounter: 1,
  filePrefix: 'SUNRISE_',
  isKioskLocked: false,
  adminPin: '',
  quickLaunchFormat: 'auto',
  timerSeconds: 0,
  flashMode: 'off',
  autoSaveToPhotos: true,
};

export default function App() {
  const deviceOrientation = useDeviceOrientation();
  const format = deviceOrientation.physicalFormat;
  const [manualFrameOffset, setManualFrameOffset] = useState(0);
  const effectiveFrameOrientation = normalizeQuarterTurn(deviceOrientation.angle + manualFrameOffset);
  const useSideFrame = effectiveFrameOrientation === 90 || effectiveFrameOrientation === 270;
  const activeFrameSource = useSideFrame ? marcoHorizontalPng : marcoVerticalPng;
  const activeFrameAspect = useSideFrame ? 1504 / 291 : 1213 / 459;

  // Active frame format: 'vertical' (9:16) or 'horizontal' (16:9)
  // Event settings & photo counter
  const [settings, setSettings] = useState<EventSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Camera mode: 'photo' or 'video'
  const [cameraMode, setCameraMode] = useState<CameraMode>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Camera settings
  const [cameraReady, setCameraReady] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  // iPhone zoom lenses: '0.5x' (Plano angular), '1x', '2x', '3x'
  const [lens, setLens] = useState<CameraLens>('1x');
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  // Capture execution & feedback
  const [isCapturing, setIsCapturing] = useState(false);

  // Media & Modals
  const [currentPhoto, setCurrentPhoto] = useState<CapturedPhoto | null>(null);
  const [currentVideo, setCurrentVideo] = useState<CapturedVideo | null>(null);
  const [lastMediaThumb, setLastMediaThumb] = useState<string | undefined>(undefined);

  const lastPhotoRef = useRef<CapturedPhoto | null>(null);
  const lastVideoRef = useRef<CapturedVideo | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const handleSwitchCamera = () => {
    if (isRecording || isCapturing) return;
    setCameraReady(false);
    setLens('1x');
    setZoom(1);
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const handleZoomChange = (nextZoom: number) => {
    setZoom(nextZoom);
    setLens(nextZoom >= 2.5 ? '3x' : nextZoom >= 1.5 ? '2x' : '1x');
  };

  const handleSelectLens = (nextLens: CameraLens) => {
    setLens(nextLens);
    setZoom(Number.parseFloat(nextLens));
  };

  // Capture Photo Execution
  const executeCaptureNow = async () => {
    if (isCapturing || !cameraReady) return;
    setCaptureError(null);
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const stage = stageRef.current;
      if (!video || !stage || !video.videoWidth || !video.videoHeight) {
        throw new Error('La cámara todavía no está lista. Vuelve a intentar.');
      }
      // Snapshot everything synchronously. Orientation/resize events after this
      // point cannot alter the photograph already requested by the user.
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      const visibleRegion = calculateVisibleVideoRegion(
        video.videoWidth,
        video.videoHeight,
        stageWidth,
        stageHeight,
        zoom,
      );
      const frameLayout = normalizeFrameLayout(
        calculateFrameLayout(stageWidth, stageHeight, effectiveFrameOrientation, activeFrameAspect),
        stageWidth,
        stageHeight,
      );
      const frameSource = activeFrameSource;

      playShutterSound();

      const photo = await composeHighResPhoto({
        videoElement: video,
        frameSource,
        visibleRegion,
        frameLayout,
        counter: settings.photoCounter,
        filePrefix: settings.filePrefix,
        facingMode,
        lens,
      });

      // Update state & counter
      lastPhotoRef.current = photo;
      setCurrentPhoto(photo);
      setLastMediaThumb(photo.dataUrl);
      setSettings((prev) => ({ ...prev, photoCounter: prev.photoCounter + 1 }));

      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (err: unknown) {
      setCaptureError(err instanceof Error ? err.message : 'No se pudo capturar la foto');
    } finally {
      setIsCapturing(false);
    }
  };

  // Video Recording: Start
  const executeStartRecording = async () => {
    if (isRecording || isCapturing || !cameraReady || !videoRef.current) return;
    setIsCapturing(true);
    setCaptureError(null);

    try {
      playRecordStartSound();

      const activeFrameDataUrl = format === 'vertical' ? marcoVerticalPng : marcoHorizontalPng;
      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';

      await new Promise<void>((resolve) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = () => resolve();
        frameImg.src = activeFrameDataUrl;
      });

      await videoRecorder.startRecording({
        videoElement: videoRef.current,
        frameImage: frameImg,
        format,
        filterId: 'original',
        lens,
        facingMode,
        counter: settings.photoCounter,
        filePrefix: settings.filePrefix,
        getZoom: () => zoomRef.current,
      });

      setIsRecording(true);
      setRecordingDuration(0);

      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'No se pudo iniciar el video');
    } finally {
      setIsCapturing(false);
    }
  };

  // Video Recording: Stop
  const executeStopRecording = async () => {
    if (!isRecording) return;

    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    playRecordStopSound();

    try {
      const activeFrameDataUrl = format === 'vertical' ? marcoVerticalPng : marcoHorizontalPng;
      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';
      frameImg.src = activeFrameDataUrl;

      const video = await videoRecorder.stopRecording({
        videoElement: videoRef.current!,
        frameImage: frameImg,
        format,
        filterId: 'original',
        lens,
        facingMode,
        counter: settings.photoCounter,
        filePrefix: settings.filePrefix,
      });

      setIsRecording(false);
      lastVideoRef.current = video;
      setCurrentVideo(video);
      setSettings((prev) => ({ ...prev, photoCounter: prev.photoCounter + 1 }));

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Error al detener grabación:', err);
      setIsRecording(false);
    }
  };

  // Shutter trigger (handles photo capture or video start/stop)
  const handleShutterTrigger = () => {
    if (isCapturing || (!cameraReady && !isRecording)) return;
    if (cameraMode === 'video') {
      if (isRecording) executeStopRecording();
      else executeStartRecording();
      return;
    }
    executeCaptureNow();
  };

  return (
    <main
      id="sunrise_camera_main_screen"
      className="fixed inset-0 w-full overflow-hidden bg-black select-none"
      style={{
        height: '100dvh',
        minHeight: '-webkit-fill-available',
      }}
    >
      {/* 100% Fullscreen Camera Viewfinder */}
      <CameraView
        facingMode={facingMode}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        videoRef={videoRef}
        stageRef={stageRef}
        frameSource={activeFrameSource}
        frameAspect={activeFrameAspect}
        frameOrientation={effectiveFrameOrientation}
        onReady={setCameraReady}
      />

      {/* Floating Top Header Controls */}
      <TopBar
        onSwitchCamera={handleSwitchCamera}
        onRotateFrame={() => setManualFrameOffset(value => (value + 90) % 360)}
        photoCount={settings.photoCounter}
      />

      {/* Floating Bottom Controls: Lens, Filters, Mode (Foto/Video), Shutter Button, Timer, Gallery */}
      <BottomControls
        cameraMode={cameraMode}
        onChangeCameraMode={setCameraMode}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        lens={lens}
        onSelectLens={handleSelectLens}
        facingMode={facingMode}
        onCapture={handleShutterTrigger}
        isCapturing={isCapturing || !cameraReady}
        lastPhotoThumb={lastMediaThumb}
        onOpenLastPhoto={() => {
          if (cameraMode === 'video' && lastVideoRef.current) {
            setCurrentVideo(lastVideoRef.current);
          } else if (lastPhotoRef.current) {
            setCurrentPhoto(lastPhotoRef.current);
          }
        }}
      />

      {captureError && <div role="alert" className="absolute top-20 inset-x-4 z-50 rounded-xl bg-red-950 p-3 text-white text-center" onClick={() => setCaptureError(null)}>{captureError}</div>}

      {/* Captured Photo Preview Modal */}
      {currentPhoto && (
        <PhotoPreviewModal
          photo={currentPhoto}
          onClose={() => setCurrentPhoto(null)}
          onRetake={() => setCurrentPhoto(null)}
        />
      )}

      {/* Captured Video Preview Modal */}
      {currentVideo && (
        <VideoPreviewModal
          video={currentVideo}
          onClose={() => setCurrentVideo(null)}
          onRetake={() => setCurrentVideo(null)}
        />
      )}

    </main>
  );
}

