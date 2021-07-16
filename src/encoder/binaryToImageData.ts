export default function(binary: string, height: number): ImageData {
  const width = binary.length;
  let img = new Uint8ClampedArray(width * height * 4);
  let row = new Uint8ClampedArray(width * 4);

  for(let i = 0; i < width; i++) {
    if(binary[i] === '1') {
      row[i * 4    ] = 0;
      row[i * 4 + 1] = 0;
      row[i * 4 + 2] = 0;
      row[i * 4 + 3] = 0xFF;
    } else {
      row[i * 4    ] = 0xFF;
      row[i * 4 + 1] = 0xFF;
      row[i * 4 + 2] = 0xFF;
      row[i * 4 + 3] = 0xFF;
    }
  }
  for(let i = 0; i < height; i++) {
    for(let j = 0; j < row.length; j++) {
      img[i * row.length + j] = row[j];
    }
  }

  return new ImageData(img, width, height);
}