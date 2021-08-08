export default function monochrome(img: Uint8ClampedArray, width: number, windowSize: number): Uint8ClampedArray {
  // calc luminance by NTSC
  const height = img.length / width;
  function getPixelOf(x: number, y: number): number | undefined {
    if(0 <= x && x < width && 0 <= y && y < height) {
      return img[x + y * width];
    }
    return;
  }

  const globalAvg = img.reduce((acc, cur) => acc+ cur / img.length, 0);
  const globalRange = img.reduce((acc, cur) => acc < cur ? cur : acc, 0) - img.reduce((acc, cur) => acc > cur ? cur : acc, 0xFF);

  const getThreshold = function(x: number, y: number): [number, number] {
    let total = 0;
    let count = 0;
    let min = 0xFF;
    let max = 0;

    for(let dx = -windowSize; dx <= windowSize; dx++) {
      for(let dy = -windowSize; dy <= windowSize; dy++) {
        const p = getPixelOf(x + dx, y + dy);
        if(p !== undefined) {
          total += p;
          count += 1;
          if(p < min) min = p;
          if(p > max) max = p;
        }
      }
    }

    if(count === 0) return [-1, -1];

    return [total / count, max - min];
  }

  const result = new Uint8ClampedArray(img.length);
  for(let x = 0; x < width; x++) {
    for(let y = 0; y < height; y++) {
      const [th, range] = getThreshold(x, y);
      if(range < globalRange * 0.07)  {
        result[x + y * width] = th < globalAvg ? 0 : 0xFF;
      } else {
        result[x + y * width] = th > img[x + y * width] ? 0 : 0xFF;
      }
    }
  }

  return result;
}