export default function gridImage(img: Uint8ClampedArray, width: number, gridWidth: number): Uint8ClampedArray {
  const height = img.length / width;
  const newWidth = Math.floor(width /gridWidth);
  const result = new Uint8ClampedArray(newWidth * height);

  for(let y = 0; y < height; y++) {
    for(let x = 0; x < newWidth; x++) {
      let count = 0;
      const index = x * gridWidth + y * width;
      for(let i = 0; i < gridWidth; i++) {
        if(img[index + i] > 0x7F) {
          count += 1;
        } else {
          count -= 1;
        }
      }
      result[x + y * newWidth] = (count > 0 ? 0xFF : 0);
    }
  }

  return result;
}