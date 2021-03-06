import './style/style.scss';

import read from './reader/reader';
import videoToImageUrl from './misc/vidoToImageUrl';
import { outputProgress, clearResult, outputCode, outputFail, manualOutputCode, outputOCR } from './misc/result';
import calcEanCheckDigit from './misc/calcEanCheckDigit';
import scaleImage from './misc/scaleImage';
import clipImage from './misc/clipImage';
import { getStringInfo, getStringCameraInfo } from './misc/getInfo';
import { CAMERA_UNAVAILABLE, CANVAS_UNAVAILABLE, CAMERA_DISCONNECTED } from './misc/const';
import Camera from './misc/camera';

let currentMode: 'barcode' | 'number' | 'ocr' = 'barcode';

const registerModeSwitch = function() {
  const selectBarcode = <HTMLButtonElement> document.querySelector('header >  .selectMode >  .select-barcode');
  const selectNumber  = <HTMLButtonElement> document.querySelector('header > .selectMode > .select-number');
  const selectOcr     = <HTMLButtonElement> document.querySelector('header > .selectMode > .select-ocr');
  const inputBarcode  = <HTMLButtonElement> document.querySelector('main > .input-barcode');
  const inputNumber   = <HTMLButtonElement> document.querySelector('main > .input-number');

  if(selectBarcode === null) {
    throw Error('Element .select-barcode is not defined');
  }
  if(selectNumber === null) {
    throw Error('Element .select-number is not defined');
  }
  if(selectOcr === null) {
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
    selectOcr.classList.remove('selected');
    inputBarcode.classList.add('selected');
    inputNumber.classList.remove('selected');

    currentMode = 'barcode';
    selectBarcode.blur();
  });

  selectNumber.addEventListener('click', () => {
    selectBarcode.classList.remove('selected');
    selectNumber.classList.add('selected');
    selectOcr.classList.remove('selected');
    inputBarcode.classList.remove('selected');
    inputNumber.classList.add('selected');

    currentMode = 'number';
    selectNumber.blur();
  });

  selectOcr.addEventListener('click', () => {
    selectBarcode.classList.remove('selected');
    selectNumber.classList.remove('selected');
    selectOcr.classList.add('selected');
    inputBarcode.classList.add('selected');
    inputNumber.classList.remove('selected');

    currentMode = 'ocr';
    selectOcr.blur();
  });
}

// tesseract worker cache
let tesseractWorker: Tesseract.Worker | null = null;

const readUrl = function(url: string) {
  outputProgress('reading');

  if(currentMode === 'barcode') {
    return read(url).then((str) => {
      outputCode(str);
    }).catch((err) => {
      outputFail('readerFailed');
    });
  } else if(currentMode === 'ocr') {
    (async function() {
      const { createWorker } = await import('tesseract.js');

      if(tesseractWorker === null) {
        tesseractWorker = createWorker();
        await tesseractWorker.load();
        await tesseractWorker.loadLanguage('eng');
        await tesseractWorker.initialize('eng');
        await tesseractWorker.setParameters({
          tessedit_char_whitelist: '0123456789',
        });
      }

      const { data } = await tesseractWorker.recognize(url);
      console.log(data);

      outputOCR(data.text);
    })();
  }
}

const registerFileUpload = function() {
  const uploadFile = document.querySelector('main > .input-barcode .uploadFile');
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

    reader.onload = async () => {
      // result must be string using FileReader.readAsDataURL
      const url = <string> reader.result;
      const scaledImgUrl = await scaleImage(url, 600);

      readUrl(scaledImgUrl);
    }

    reader.readAsDataURL(file);
  });

  uploadButton.addEventListener('click', () => {
    uploadButton.blur();
    uploadInput.click();
  });
}

interface cameraButtonState {
  capture?: boolean,
  switch?: boolean
}
const setCameraButtonState = function(state: cameraButtonState) {
  const captureButton = document.querySelector('main .capture button');
  const switchButton = document.querySelector('main .switchCamera button');

  if(captureButton === null) {
    throw Error('Element main .capture button is not defined');
  }
  if(switchButton === null) {
    throw Error('Element main .switchCamera button is not defined');
  }

  if(Object.prototype.hasOwnProperty.call(state, 'capture')) {
    if(state.capture) {
      captureButton.classList.remove('disabled');
    } else {
      captureButton.classList.add('disabled');
    }
  }
  if(Object.prototype.hasOwnProperty.call(state, 'switch')) {
    if(state.switch) {
      switchButton.classList.remove('disabled');
    } else {
      switchButton.classList.add('disabled');
    }
  }
}

const registerCameraSwitch = function(camera: Camera) {
  const button = document.querySelector('main > .input-barcode .switchCamera button');
  if(button === null) {
    throw Error('Element .input-barcode .switchCamera button is not defined');
  }

  button.addEventListener('click', async () => {
    if(button.classList.contains('disabled')) {
      return;
    }

    try {
      await camera.swtichFacingMode();
      setCameraButtonState({
        capture: true,
        switch: true
      });

      camera.registerCanvasUpdate().catch((err) => {
        if(err === CAMERA_DISCONNECTED) {
          outputFail('cameraDisconnected');
          setCameraButtonState({
            capture: false
          });
        } else {
          throw err;
        }
      });
    } catch(err) {
      if(err === CAMERA_UNAVAILABLE) {
        outputFail('cameraUnavailable');
      } else {
        throw err;
      }
    }
  });
}

const registerCamera = function() {
  const width = 640;
  const height = 320;

  const cameraSrc = <HTMLVideoElement> document.getElementById('cameraSrc');
  if(cameraSrc === null) {
    throw Error('Element #cameraScr is not defined');
  }

  const cameraPreview = <HTMLCanvasElement> document.getElementById('cameraPreview');
  if(cameraPreview === null) {
    throw Error('Element #cameraPreview is not defined');
  }

  const camera = new Camera(width, height, cameraSrc, cameraPreview);

  return camera.init().then(() => {
    camera.registerCanvasUpdate().catch((err) => {
      if(err === CAMERA_DISCONNECTED) {
        outputFail('cameraDisconnected');
        setCameraButtonState({
          capture: false
        });
      } else {
        throw err;
      }
    });

    return camera;
  });
}

const registerCaptureButton = function(width: number, height: number) {
  const captureBtn = document.querySelector('main .capture button');

  if(captureBtn === null) {
    throw Error('Element main .capture button is not defined');
  }

  captureBtn.addEventListener('click', (e) => {
    if(captureBtn.classList.contains('disabled')) {
      return;
    }

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

    const url_ = videoToImageUrl(cameraSrc);
    console.log(width, height);

    clipImage(url_, width / 8, (Math.max(width, height) - width * 3 / 16) / 2, width * 3 / 4, width * 3 / 16).then((url) => {
      readUrl(url);
    })
  });
}

const registerNumberInput = function() {
  const length13 = document.querySelector('main > .input-number > .length-13');
  const length8 = document.querySelector('main > .input-number > .length-8');

  if(length13 === null) {
    throw Error('Element .length-13 is not defined.');
  }
  if(length8 === null) {
    throw Error('Element .length-8 is not defined.');
  }

  // is the elements ordered?
  const input13 = Array.from(length13.querySelectorAll('input'));
  const input8 = Array.from(length8.querySelectorAll('input'));

  if(input13.length !== 13) {
    throw Error('Element number is wrong in .length-13');
  }
  if(input8.length !== 8) {
    throw Error('Element number is wrong in .length-8');
  }

  const regisiter = function(arr: HTMLInputElement[]) {
    for(let i = 0; i < arr.length - 1; i++) {
      const d = arr[i];

      d.addEventListener('focus', (e) => {
        // select text
        const el = <HTMLInputElement>e.target;
        el.focus();
        el.select();
      });

      d.addEventListener('input', (e) => {
        // focus next input
        const el = <HTMLInputElement>e.target;
        el.value = el.value.slice(-1);
        arr[i + 1].focus();

        if(arr.slice(0, -1).every(v => /[0-9]/.test(v.value))) {
          // all inputs are filled
          // complete check digit input and generate jan
          const code = arr.slice(0, -1).map(v => v.value).join('');
          const checkDigit = calcEanCheckDigit(code);
          arr[arr.length - 1].value = '' + checkDigit;
          manualOutputCode(code + checkDigit);
        } else {
          // clear check digit
          clearResult();
          arr[arr.length - 1].value = '';
        }
      });
    }
  }

  regisiter(input13);
  regisiter(input8);
}

const registerInfo = function() {
  const button = document.querySelector('main .info button');
  const output = document.querySelector('main .info .output');

  if(button === null) {
    throw Error('Element main .info button is not defined.');
  }
  if(output === null) {
    throw Error('Element main .info .output if not defined');
  }

  button.addEventListener('click', async () => {
    output.classList.toggle('hidden');

    if(!output.classList.contains('hidden')) {
      output.innerHTML = (await getStringInfo()).replace(/\r|\n|\r\n/g, '<br>');
    }
  });
}

window.addEventListener('load', async () => {
  registerModeSwitch();
  registerFileUpload();
  registerNumberInput();
  registerInfo();

  try {
    const camera = await registerCamera();
    registerCameraSwitch(camera);
    registerCaptureButton(camera.width, camera.height);
  } catch(err) {
    setCameraButtonState({
      capture: false,
      switch: false
    });

    if(err === CAMERA_UNAVAILABLE) {
      console.log(err);
      outputFail('cameraUnavailable');
    } else if(err === CANVAS_UNAVAILABLE) {
      console.log(err);
      outputFail('canvasUnavailable');
    } else {
      throw err;
    }
  }
});