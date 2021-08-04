export default function createImage(imgData: ImageData): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
  ctx.putImageData(imgData, 0, 0);

  const img = new Image();
  img.src = canvas.toDataURL();

  return img;
}