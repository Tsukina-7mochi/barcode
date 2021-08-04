import './style/style.scss';

import read from './reader/reader';
import videoToImageUrl from './misc/vidoToImageUrl';
import { outputProgress, clearResult, outputCode, outputFail } from './misc/result';

const CANVAS_UNAVAILABLE = 'Cannot use canvas';
const CAMERA_UNAVAILABLE = 'Cannot use camera';

const registerModeSwitch = function() {
  const selectBarcode = document.querySelector('header >  .selectMode >  .select-barcode');
  const selectNumber = document.querySelector('header > .selectMode > .select-number');
  const inputBarcode = document.querySelector('main > .input-barcode');
  const inputNumber = document.querySelector('main > .input-number');

  if(selectBarcode === null) {
    throw Error('Element .select-barcode is not defined');
  }
  if(selectNumber === null) {
    throw Error('Element .select-number is not defined');
  }
  if(inputBarcode === null) {
    throw Error('Element .input-barcode is not defined')
  }
  if(inputNumber === null) {
    throw Error('Element .input-number is not defined')
  }

  selectBarcode.addEventListener('click', () => {
    selectBarcode.classList.add('selected');
    selectNumber.classList.remove('selected');
    inputBarcode.classList.add('selected');
    inputNumber.classList.remove('selected');
  });

  selectNumber.addEventListener('click', () => {
    selectBarcode.classList.remove('selected');
    selectNumber.classList.add('selected');
    inputBarcode.classList.remove('selected');
    inputNumber.classList.add('selected');
  });
}

const readUrl = function(url: string) {
  outputProgress('reading');

  return read(url).then((str) => {
    outputCode(str);
  }).catch((err) => {
    outputFail('readerFailed');
  });
}

const registerFileUpload = function() {
  const uploadFile = document.querySelector('main > .input-barcode > .uploadFile');
  if(uploadFile === null) {
    throw Error('Element .uploadFile is not defined');
  }

  const uploadButton = uploadFile.querySelector('button');
  const uploadInput = <HTMLInputElement> uploadFile.querySelector('input[type=file]');
  if(uploadButton === null) {
    throw Error('Element .uploadFile > button is not defined');
  }
  if(uploadInput === null) {
    throw Error('Element .uploadFile > input[type=file] is not defined')
  }

  uploadInput.addEventListener('change', (e: any) => {
    const file: File = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      // result must be string using FileReader.readAsDataURL
      const url = <string> reader.result;
      readUrl(url);
    }

    reader.readAsDataURL(file);
  });

  uploadButton.addEventListener('click', () => {
    uploadButton.blur();
    uploadInput.click();
  });
}

const registerCamera = function() {
  const width = 640;
  const height = 320;
  const guideRect = {
    x: 80,
    y: 100,
    width: 480,
    height: 120
  }

  const cameraSrc = <HTMLVideoElement> document.getElementById('cameraSrc');

  if(cameraSrc === null) {
    throw Error('Element #cameraScr is not defined');
  }

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { ideal: width },
      height: { ideal: height }
    }
  }).catch(() => {
    throw CAMERA_UNAVAILABLE;
  }).then((stream) => {
    cameraSrc.srcObject = stream;

    // register canvas
    const cameraPreview = <HTMLCanvasElement> document.getElementById('cameraPreview');
    if(cameraPreview === null) {
      throw Error('Element #cameraPreview is not defined');
    }

    cameraPreview.setAttribute('width', width + 'px');
    cameraPreview.setAttribute('height', height + 'px');
    const cameraPreviewCtx = cameraPreview.getContext('2d');

    if(cameraPreviewCtx === null) {
      throw CANVAS_UNAVAILABLE;
    }

    cameraPreviewCtx.fillStyle = '#FFFFFF';
    cameraPreviewCtx.strokeStyle = '#FFFFFF';
    cameraPreviewCtx.lineWidth = 1;

    const drawToCanvas = function() {
      cameraPreviewCtx.save();

      cameraPreviewCtx.clearRect(0, 0, width, height);

      cameraPreviewCtx.globalAlpha = 0.2;
      cameraPreviewCtx.fillRect(0, 0, width, height);
      cameraPreviewCtx.globalAlpha = 1;

      cameraPreviewCtx.clearRect(guideRect.x, guideRect.y, guideRect.width, guideRect.height);
      cameraPreviewCtx.strokeRect(guideRect.x, guideRect.y, guideRect.width, guideRect.height);

      cameraPreviewCtx.globalCompositeOperation = 'destination-over';

      cameraPreviewCtx.drawImage(cameraSrc, 0, 0);

      cameraPreviewCtx.restore();

      requestAnimationFrame(drawToCanvas);
    };

    requestAnimationFrame(drawToCanvas);
  });
}

const registerCaptureButton = function() {
  const captureBtn = document.querySelector('main .capture button');

  if(captureBtn === null) {
    throw Error('Element main .capture button is not defined');
  }

  captureBtn.addEventListener('click', (e) => {
    const cameraSrc = <HTMLVideoElement> document.getElementById('cameraSrc');
    const resultFail = document.querySelector('main .result .fail');
    const resultCode = document.querySelector('main .result .code');

    if(cameraSrc === null) {
      throw Error('Element #cameraScr is not defined');
    }
    if(resultFail === null) {
      throw Error('Element main .result .fail is not defined');
    }
    if(resultCode === null) {
      throw Error('Element main .result .code is not defined.');
    }

    const url = videoToImageUrl(cameraSrc);
    readUrl(url);
  });
}

const disableCaptureButton = function() {
  const captureBtn = document.querySelector('main .capture button');

  if(captureBtn === null) {
    throw Error('Element main .capture button is not defined');
  }

  captureBtn.classList.add('disabled');
}

window.addEventListener('load', async () => {
  try {
    registerModeSwitch();

    registerFileUpload();

    await registerCamera();

    registerCaptureButton();
  } catch(err) {
    if(err === CAMERA_UNAVAILABLE) {
      console.log(err);
      outputFail('cameraUnavailable');
      disableCaptureButton();
    } else if(err === CANVAS_UNAVAILABLE) {
      console.log(err);
      outputFail('canvasUnavailable');
      disableCaptureButton();
    } else {
      throw err;
    }
  }
});