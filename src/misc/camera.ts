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
  stream: MediaStream;
  currentFacingMode: 'environment' | 'user';
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

  init() {
    const self = this;

    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: Math.max(self.width, self.height),
        height: Math.max(self.width, self.height)
      }
    }).catch((err) => {
      console.error(err);
      throw CAMERA_UNAVAILABLE;
    }).then((stream) => {
      self.cameraSrc.srcObject = stream;
      self.stream = stream;

      return wait(1000);
    }).then(() => {
      return navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.currendDeviceIndex = 0;
        this.deviceIdList = devices.filter((device) => (device.kind === 'videoinput')).map((device) => device.deviceId);
      });
    }).then(() => {
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

      self.cameraPreview.setAttribute('width', canvasWidth + 'px');
      self.cameraPreview.setAttribute('height', canvasHeight + 'px');

      setFocusMode(this.stream);
      this.setFacingMode('environment');
    });
  }

  updateCanvas(this: Camera) {
    const self = this;

    self.cameraPreviewCtx.save();

    self.cameraPreviewCtx.clearRect(0, 0, self.width, self.height);

    self.cameraPreviewCtx.globalAlpha = 0.2;
    self.cameraPreviewCtx.fillRect(0, 0, self.width, self.height);
    self.cameraPreviewCtx.globalAlpha = 1;

    self.cameraPreviewCtx.clearRect(self.guideRect.x, self.guideRect.y, self.guideRect.width, self.guideRect.height);
    self.cameraPreviewCtx.strokeRect(self.guideRect.x, self.guideRect.y, self.guideRect.width, self.guideRect.height);

    self.cameraPreviewCtx.globalCompositeOperation = 'destination-over';

    self.cameraPreviewCtx.drawImage(self.cameraSrc, self.canvasRect.x, self.canvasRect.y, self.canvasRect.width, self.canvasRect.height);

    self.cameraPreviewCtx.restore();
  }

  registerCanvasUpdate(this: Camera) {
    const self = this;

    return new Promise((_resolve, reject) => {
      const update = function() {
        self.updateCanvas.call(self);

        if(self.stream.active) {
          requestAnimationFrame(update);
        } else {
          reject(CAMERA_DISCONNECTED);
        }
      }

      requestAnimationFrame(update);
    });
  }

  setFacingMode(this: Camera, mode: 'environment' | 'user') {
    const track = this.stream.getVideoTracks()[0];

    const capabilities = track.getCapabilities();

    if(capabilities.facingMode) {
      return track.applyConstraints({
        facingMode: { exact: mode }
      }).catch(() => {
        track.applyConstraints({
          facingMode: mode
        });
      }).catch(() => {
        console.info(`Cannnot set facing mode to ${mode}.`);
      });
    }
  }

  async swtichFacingMode(this: Camera) {
    // explicitly switch current facing mode instead of detecting from track
    if(this.currentFacingMode === 'environment') {
      await this.setFacingMode('user');
      this.currentFacingMode = 'user';
    } else {
      await this.setFacingMode('environment');
      this.currentFacingMode = 'environment';
    }

    return this.currentFacingMode;
  }

  switchDevice(this: Camera) {
    const track = this.stream.getVideoTracks()[0];

    this.currendDeviceIndex = (this.currendDeviceIndex + 1) % this.deviceIdList.length;
    return track.applyConstraints({
      deviceId: { exact: this.deviceIdList[this.currendDeviceIndex] }
    });
  }
}

export default Camera;