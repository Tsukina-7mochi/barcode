import encode from './encoder/encoder';
import createImage from './createImage';
import decode from './decoder/decoder';
import read from './reader/reader';

const getRadioValue = function(name: string): string | undefined {
  const inputs = <NodeListOf<HTMLInputElement>> document.querySelectorAll(`input[name=${name}]`);
  const element = Array.from(inputs).find(el => el.checked);

  return (element ? element.value : undefined);
}

// decode('00000000000101000101101001110010011001100101001110011011010101100110111001010001001010000101110010010001010000000');
// decode('00000000000101000101101001110110111000110101100110110011010101001110100001011011001011100111001010000101010000000');
// decode('000000000001010001000000010100110010010011011110101000110101010011101010000100010011100101010000000')
// decode('0000000000000011100010000000000001101001000010111100100100011110101111011101010110010000110110011001011110010010011110100100100111101000011010011000010100100110100001000011001011000111010110000000000')
// decode('00000000001101001110010110011100100010110001110001011011000010100110111101101001111001011000111010110000000000')
decode('0000000000110100001001101110100010001110110101110110001000110100010100110000110111000101000110100011100010110110111000101000010110011000111010110000000000')

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
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    console.log(url);

    const img = new Image();
    img.onload = () => {
      console.log(url);
      URL.revokeObjectURL(url);

      // const w = Math.min(img.naturalWidth, 1000);
      const w = img.naturalWidth;
      const h = w * img.naturalHeight / img.naturalWidth;

      const canvas = <HTMLCanvasElement> document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      const imgData = <ImageData> ctx?.getImageData(0, 0, w, h);
      console.log('result: ' + read(imgData));
      ;
    }
    img.src = url;
  });
});