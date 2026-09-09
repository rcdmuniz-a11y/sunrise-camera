import { CameraFormat, CameraLens, FilterId, CapturedVideo } from '../types/camera';
import { drawCameraSource, drawEventFrame } from './cameraGeometry';

export interface VideoRecordOptions {
  videoElement: HTMLVideoElement;
  frameImage: HTMLImageElement | null;
  format: CameraFormat;
  filterId: FilterId;
  lens: CameraLens;
  facingMode: 'user' | 'environment';
  counter: number;
  filePrefix: string;
  getZoom?: () => number;
}

export class VideoRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private animFrameId: number | null = null;
  private audioStream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private startTime: number = 0;
  private isRecordingActive: boolean = false;

  public get isRecording(): boolean {
    return this.isRecordingActive;
  }

  public async startRecording(options: VideoRecordOptions): Promise<void> {
    if (this.isRecordingActive) return;
    this.recordedChunks = [];

    const { videoElement, frameImage, format, filterId, lens, facingMode } = options;

    // Target dimensions for smooth high-quality recording
    const isVertical = format === 'vertical';
    if (videoElement.readyState < 2 || !videoElement.videoWidth) throw new Error('La cámara todavía no está lista');
    const canvasWidth = isVertical ? 960 : 1280;
    const canvasHeight = isVertical ? 1280 : 960;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('No se pudo inicializar contexto 2D para video');
    this.canvas = canvas;

    const renderLoop = () => {
      if (!this.isRecordingActive) return;
      if (videoElement.readyState >= 2) {
        drawCameraSource(ctx, videoElement, videoElement.videoWidth, videoElement.videoHeight,
          canvasWidth, canvasHeight, facingMode === 'user', lens,
          options.getZoom?.());
        if (frameImage?.naturalWidth) drawEventFrame(ctx, frameImage, canvasWidth, canvasHeight);
      }
      this.animFrameId = requestAnimationFrame(renderLoop);
    };

    // Obtain combined stream (video from canvas + audio from microphone)
    let outputStream: MediaStream;
    try {
      const canvasStream = canvas.captureStream ? canvas.captureStream(30) : null;
      if (!canvasStream) throw new Error('Canvas captureStream not supported');

      outputStream = new MediaStream();
      canvasStream.getVideoTracks().forEach((track) => outputStream.addTrack(track));

      // Attempt to acquire microphone audio
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          this.audioStream = mic;
          mic.getAudioTracks().forEach((track) => outputStream.addTrack(track));
        }
      } catch {
        // Video without audio if mic access is not granted
      }
    } catch {
      // Fallback: direct camera stream
      const srcStream = videoElement.srcObject as MediaStream;
      if (!srcStream) throw new Error('No se pudo acceder al flujo de video');
      outputStream = srcStream;
    }

    // Determine supported mime type
    const candidateMimes = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let chosenMime = '';
    for (const mime of candidateMimes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
        chosenMime = mime;
        break;
      }
    }

    const recorderOptions: MediaRecorderOptions = chosenMime ? { mimeType: chosenMime } : {};
    const recorder = new MediaRecorder(outputStream, recorderOptions);

    this.recordedChunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder = recorder;
    this.isRecordingActive = true;
    this.startTime = Date.now();

    // Start video drawing loop
    renderLoop();

    // Collect in 500ms chunks for smooth recording
    recorder.start(500);
  }

  public stopRecording(options: VideoRecordOptions): Promise<CapturedVideo> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecordingActive) {
        return reject(new Error('No hay una grabación activa'));
      }

      const recorder = this.mediaRecorder;
      const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      recorder.onstop = () => {
        this.isRecordingActive = false;

        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }

        if (this.audioStream) {
          this.audioStream.getTracks().forEach((t) => t.stop());
          this.audioStream = null;
        }

        const mimeType = recorder.mimeType || 'video/mp4';
        const isMp4 = mimeType.includes('mp4');
        const extension = isMp4 ? 'mp4' : 'webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        const id = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const counterStr = String(options.counter).padStart(3, '0');
        const filename = `${options.filePrefix || 'SUNRISE_'}VID_${counterStr}.${extension}`;

        const captured: CapturedVideo = {
          id,
          filename,
          blobUrl,
          blob,
          format: options.format,
          filterId: options.filterId,
          filterName: options.filterId.toUpperCase(),
          timestamp: new Date(),
          lens: options.lens,
          durationSeconds,
        };

        resolve(captured);
      };

      try {
        recorder.stop();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const videoRecorder = new VideoRecorderService();
