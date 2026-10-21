import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  @ViewChild('videoEl', { static: false }) videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayEl', { static: false }) overlayEl!: ElementRef<HTMLCanvasElement>;

  errorMsg = '';
  isStarting = false;
  cameraReady = false;
  startupStatus = 'Abriendo cámara...';
  detectionStatus = 'Esperando inicio';
  cameraAspectRatio = '16 / 9';
  private handDetected = false;
  private handLandmarker: HandLandmarker | null = null;
  private overlayContext: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  async startRA() {
    if (this.isStarting || this.cameraReady) return;

    this.errorMsg = '';
    this.isStarting = true;
    try {
      if (!window.isSecureContext) {
        throw new Error('La cámara requiere una conexión segura. Abre la app desde localhost o HTTPS.');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Este navegador no soporta acceso a cámara.');
      }

      await this.startVideo();
      this.cameraReady = true;
      this.startupStatus = 'Cargando detección de mano...';
      await this.initHandLandmarker();
      this.initOverlay();
      this.detectionStatus = 'Buscando mano';
      this.rafLoop();
      this.startupStatus = '';
    } catch (err: any) {
      this.errorMsg = this.getCameraErrorMessage(err);
    } finally {
      this.isStarting = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  private getCameraErrorMessage(err: any): string {
    switch (err?.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'El navegador bloqueó el permiso de cámara. Permite el acceso a la cámara para localhost desde el icono junto a la dirección y vuelve a intentarlo.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No se encontró una cámara conectada al computador.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'La cámara está ocupada por otra aplicación o el navegador no puede acceder a ella. Cierra otras apps que la estén usando y vuelve a intentarlo.';
      default:
        return err?.message || 'No se pudo iniciar la cámara.';
    }
  }

  async startVideo() {
    if (!this.videoEl?.nativeElement) {
      throw new Error('El video aún no está listo.');
    }

    const video = this.videoEl.nativeElement;
    video.muted = true;
    video.playsInline = true;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    video.srcObject = stream;
    await video.play();

    const canvas = this.overlayEl.nativeElement;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    this.cameraAspectRatio = `${canvas.width} / ${canvas.height}`;
    this.changeDetectorRef.detectChanges();
  }

  async initHandLandmarker() {
    if (this.handLandmarker) return;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'
    );
    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: new URL('assets/models/hand_landmarker.task', document.baseURI).toString(),
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
    });
  }

  initOverlay() {
    const canvas = this.overlayEl.nativeElement;
    this.overlayContext = canvas.getContext('2d');
    if (!this.overlayContext) throw new Error('No se pudo crear el canvas de dibujo.');
  }

  rafLoop = async () => {
    const video = this.videoEl.nativeElement;
    if (!this.handLandmarker || !this.overlayContext) return;
    const canvas = this.overlayEl.nativeElement;
    this.overlayContext.clearRect(0, 0, canvas.width, canvas.height);
    const result: HandLandmarkerResult = this.handLandmarker.detectForVideo(video, performance.now());
    if (result?.landmarks?.length) {
      if (!this.handDetected) {
        this.handDetected = true;
        this.detectionStatus = 'Índice detectado';
        this.changeDetectorRef.detectChanges();
      }
      const landmark = result.landmarks[0][8];
      this.overlayContext.beginPath();
      this.overlayContext.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        Math.max(18, canvas.height * 0.05),
        0,
        2 * Math.PI,
      );
      this.overlayContext.strokeStyle = 'rgba(255, 0, 0, 0.9)';
      this.overlayContext.lineWidth = Math.max(6, canvas.height * 0.015);
      this.overlayContext.stroke();
    } else {
      if (this.handDetected) {
        this.handDetected = false;
        this.detectionStatus = 'Buscando mano';
        this.changeDetectorRef.detectChanges();
      }
    }
    this.animationFrameId = requestAnimationFrame(this.rafLoop);
  };

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.videoEl?.nativeElement?.srcObject) {
      const tracks = (this.videoEl.nativeElement.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }
  }

}
