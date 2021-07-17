export default function monochrome(img: Uint8ClampedArray): Uint8ClampedArray {
  // calc luminance by NTSC
  const result = new Uint8ClampedArray(img.length / 4);

  for(let i = 0; i < result.length; i++) {
    const r = img[i * 4 + 0];
    const g = img[i * 4 + 1];
    const b = img[i * 4 + 2];
    result[i] = r * 0.30 + g * 0.59 + b * 0.11;
  }

  return result;
}