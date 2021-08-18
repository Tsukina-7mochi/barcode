const urlToImageData = function(imgUrl: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');
    img.src = imgUrl;

    img.onload = function() {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      canvas.setAttribute('width', width + 'px');
      canvas.setAttribute('height', height + 'px');

      const ctx = canvas.getContext('2d');

      if(ctx === null) {
        reject('Failed to get context');
      } else {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(ctx.getImageData(0, 0, width, height));
      }
    }
  });
}

export default urlToImageData;