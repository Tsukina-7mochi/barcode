import { CANVAS_UNAVAILABLE } from "./const";

const clipImage = function(imgUrl: string, x: number, y: number, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', width + 'px');
    canvas.setAttribute('height', height + 'px');
    const ctx = canvas.getContext('2d');

    if(ctx === null) {
      throw Error(CANVAS_UNAVAILABLE);
    }

    const img = document.createElement('img');
    img.src = imgUrl;

    img.onload = function() {
      ctx.drawImage(img, -x, -y);
      resolve(canvas.toDataURL());
    }
  });
}

export default clipImage;