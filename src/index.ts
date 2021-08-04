import './style/style.scss';

import encode from './encoder/encoder';
import createImage from './createImage';
import read from './reader/reader';

const getRadioValue = function(name: string): string | undefined {
  const inputs = <NodeListOf<HTMLInputElement>> document.querySelectorAll(`input[name=${name}]`);
  const element = Array.from(inputs).find(el => el.checked);

  return (element ? element.value : undefined);
}

window.addEventListener('load', () => {
  document.getElementById('start')?.addEventListener('click', () => {
    const code = (<HTMLInputElement>document.getElementById('code'))?.value;
    const type = getRadioValue('code-type');

    if(type === undefined) {
      console.error('The type is not selected');
      return;
    }
    if(type !== 'JAN' && type !== 'Code128-A' && type !== 'Code128-B' && type !== 'Code128-C') {
      console.error('Unsupported type: ' + type);
      return;
    }

    const img = createImage(encode(code, type));
    (<HTMLElement> document.querySelector('div#output')).innerHTML = '';
    document.querySelector('div#output')?.appendChild(img);
  });

  document.getElementById('fileUpload')?.addEventListener('change', (e: any) => {
    const file: File = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      // result must be string using FileReader.readAsDataURL
      const url = <string> reader.result;

      console.log(url);
      console.log('result: ' + read(url));

      // const img = new Image();
      // img.src = url;
      // document.getElementById('output')?.appendChild(img);
    }

    reader.readAsDataURL(file);
  });

  return;

  // camera capture
  const width = 640;
  const height = 480;
  const guideRect = {
    x: 80,
    y: 180,
    width: 480,
    height: 120
  }
  const cameraSrc = <HTMLVideoElement> document.getElementById('cameraSrc');
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { ideal: width },
      height: { ideal: height }
    }
  }).then((stream) => {
    cameraSrc.srcObject = stream;

    // register canvas
    const cameraPreview = <HTMLCanvasElement> document.getElementById('cameraPreview');
    cameraPreview.setAttribute('width', width + 'px');
    cameraPreview.setAttribute('height', height + 'px');
    const cameraPreviewCtx = cameraPreview.getContext('2d');

    if(cameraPreviewCtx) {
      cameraPreviewCtx.fillStyle = '#FFFFFF';
      cameraPreviewCtx.strokeStyle = '#FFFFFF';
      cameraPreviewCtx.lineWidth = 1;

      const drawToCanvas = () => {
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
    }

    // register capture button
    const captureBtn = document.querySelector('main .capture button');

    if(captureBtn) {
      captureBtn.addEventListener('click', (e) => {
        const url = cameraPreview.toDataURL();

        read(url).then((str) => {
          console.log('result: ' + str);
        })
      });
    } else {
      console.error('no capture button');
    }
  });
});