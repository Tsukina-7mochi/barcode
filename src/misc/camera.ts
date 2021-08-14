import { CAMERA_UNAVAILABLE, CANVAS_UNAVAILABLE, CAMERA_DISCONNECTED } from './const';
import setFocusMode from "./setFocusMode";

interface Rect {
  x: number,
  y: number,
  width: number,
  height: number
}

const wait = (seconds: number) => new Promise((resolve) => {
  setTimeout(resolve, seconds);
});

class Camera {
  width: number;
  height: number;
  cameraSrc: HTMLVideoElement;
  cameraPreview: HTMLCanvasElement;
  cameraPreviewCtx: CanvasRenderingContext2D;
  guideRect: Rect;
  canvasRect: Rect;
  stream: MediaStream | null = null;
  currentFacingMode: 'environment' | 'user';
  zoom: number = 1
  zoomCanvasRect: () => Rect;
  deviceIdList: string[];
  currendDeviceIndex: number;

  constructor(width: number, height: number, cameraSrc: HTMLVideoElement, cameraPreview: HTMLCanvasElement) {
    this.width = width;
    this.height = height;
    this.cameraSrc = cameraSrc;
    this.cameraPreview = cameraPreview;

    const ctx = cameraPreview.getContext('2d');
    if(ctx === null) {
      throw CANVAS_UNAVAILABLE;
    }
    this.cameraPreviewCtx = ctx;

    if(!navigator?.mediaDevices?.getUserMedia) {
      throw CAMERA_UNAVAILABLE;
    }
  }

  init(this: Camera, facingMode?: 'environment' | 'user'): Promise<void> {
    const self = this;

    if(!facingMode) {
      // call with facing mode 'environment', then 'user' if failed
      return self.init('environment').catch(() => {
        return self.init('user');
      }).catch(() => {
        throw CAMERA_UNAVAILABLE;
      });
    }

    self.currentFacingMode = facingMode;

    // stop existing stream
    if(self.stream) {
      self.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    // generate stream
    const constraints = {
      audio: false,
      video: {
        width: Math.max(self.width, self.height),
        height: Math.max(self.width, self.height),
        facingMode: (facingMode === 'user' ? facingMode : { exact: facingMode })
      }
    };

    return (async function() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        self.stream = stream;
        self.cameraSrc.srcObject = stream;

        await new Promise((resolve) => {
          self.cameraSrc.onloadedmetadata = resolve;
        });

        self.cameraSrc.play();
        await wait(1000);
      } catch(err) {
        console.info(err);
        throw CAMERA_UNAVAILABLE;
      }

      const aspectRatio = self.height / self.width;
      const realWidth = self.cameraSrc.videoWidth;
      const realHeight = self.cameraSrc.videoHeight;
      const canvasWidth = 640;
      const canvasHeight = canvasWidth * aspectRatio;

      self.guideRect = {
        x: canvasWidth / 8,
        y: (canvasHeight - canvasWidth * 3 / 16) / 2,
        width: canvasWidth * 3 / 4,
        height: canvasWidth * 3 / 16
      }

      self.canvasRect = {
        x: (canvasWidth - realWidth) / 2,
        y: (canvasHeight - realHeight) / 2,
        width: realWidth,
        height: realHeight
      }

      self.zoomCanvasRect = () => ({
        x: self.canvasRect.x - self.canvasRect.width / 2 * (self.zoom - 1),
        y: self.canvasRect.y - self.canvasRect.height / 2 * (self.zoom - 1),
        width: realWidth * self.zoom,
        height: realHeight * self.zoom,
      });

      self.cameraPreview.setAttribute('width', canvasWidth + 'px');
      self.cameraPreview.setAttribute('height', canvasHeight + 'px');

      const ctx = self.cameraPreview.getContext('2d');
      if(ctx === null) {
        throw Error(CANVAS_UNAVAILABLE);
      }

      self.cameraPreviewCtx =ctx;
    })();
  }

  updateCanvas(this: Camera) {
    const self = this;

    self.cameraPreviewCtx.strokeStyle = '#FFFFFF';
    self.cameraPreviewCtx.lineWidth = 1;
    self.cameraPreviewCtx.fillStyle = '#FFFFFF';

    self.cameraPreviewCtx.save();

    self.cameraPreviewCtx.clearRect(0, 0, self.width, self.height);

    self.cameraPreviewCtx.globalAlpha = 0.2;
    self.cameraPreviewCtx.fillRect(0, 0, self.width, self.height);
    self.cameraPreviewCtx.globalAlpha = 1;

    self.cameraPreviewCtx.clearRect(self.guideRect.x, self.guideRect.y, self.guideRect.width, self.guideRect.height);
    self.cameraPreviewCtx.strokeRect(self.guideRect.x, self.guideRect.y, self.guideRect.width, self.guideRect.height);

    self.cameraPreviewCtx.globalCompositeOperation = 'destination-over';

    self.cameraPreviewCtx.drawImage(self.cameraSrc, self.zoomCanvasRect().x, self.zoomCanvasRect().y, self.zoomCanvasRect().width, self.zoomCanvasRect().height);

    self.cameraPreviewCtx.restore();
  }

  registerCanvasUpdate(this: Camera) {
    const self = this;

    return new Promise((_resolve, reject) => {
      const update = function() {
        if(self.stream && self.stream.active) {
          self.updateCanvas.call(self);
          requestAnimationFrame(update);
        } else {
          reject(CAMERA_DISCONNECTED);
        }
      }

      update();
    });
  }

  async swtichFacingMode(this: Camera) {
    // explicitly switch current facing mode instead of detecting from track
    if(this.currentFacingMode === 'environment') {
      await this.init('user');
    } else {
      await this.init('environment');
    }

    return this.currentFacingMode;
  }
}

export default Camera;