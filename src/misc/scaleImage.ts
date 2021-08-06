const scaleImage = function(imgUrl: string, length: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const img = document.createElement('img');
    img.src = imgUrl;

    img.onload = function() {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let width = 0;
      let height = 0;

      if(img.naturalWidth > img.naturalHeight) {
        width = Math.floor(length);
        height = Math.floor(length / aspectRatio);
      } else {
        width = Math.floor(length * aspectRatio);
        height = Math.floor(length);
      }
      canvas.setAttribute('width', width + 'px');
      canvas.setAttribute('height', height + 'px');

      console.log(img.naturalWidth, img.naturalHeight);
      console.log(width, height);

      const ctx = canvas.getContext('2d');

      if(ctx === null) {
        reject('Failed to get context');
      } else {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL());
      }
    }
  });
}

export default scaleImage;