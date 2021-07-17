import toMonochrome from "./monochromeConverter";
import toBinary from './binarizer'
import toGrid from './gridImage';
import createImage from "../createImage";
import decode from '../decoder/decoder';

const monochromeImageToImageData = function(data: Uint8ClampedArray, width: number): ImageData {
  const arr = new Uint8ClampedArray(data.length * 4);

  for(let i = 0; i < data.length; i++) {
    arr[i * 4 + 0] = data[i];
    arr[i * 4 + 1] = data[i];
    arr[i * 4 + 2] = data[i];
    arr[i * 4 + 3] = 0xFF;
  }

  return new ImageData(arr, width);
}

export default function reader(img: ImageData): string | undefined {
  const width = img.width;
  const height = img.height;

  const monochrome = toMonochrome(img.data);

  document.querySelector('div#output')?.appendChild(createImage(monochromeImageToImageData(monochrome, width)));

  const binary = toBinary(monochrome, width, 8);

  document.querySelector('div#output')?.appendChild(createImage(monochromeImageToImageData(binary, width)));

  for(let gridSize = 1; gridSize < width * 0.1; gridSize += 0.1) {
    // grid
    const gridded = toGrid(binary, width, gridSize);
    document.querySelector('div#output')?.appendChild(createImage(monochromeImageToImageData(gridded, Math.floor(width / gridSize))));

    // scan
    const scanLine = function(y: number): string | undefined {
      const str = binary.slice(y * width, (y + 1) * width).reduce((acc, cur) => acc + (cur > 0x7F ? '0' : '1'), '');
      return decode(str);
    }
    for(let y = 0; y < height; y++) {
      const result = scanLine(Math.floor(y));
      if(result) return result;
    }
  }

  return;
}