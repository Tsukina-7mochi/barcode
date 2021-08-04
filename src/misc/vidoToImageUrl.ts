export default function(video: HTMLVideoElement): string {
  const w = video.videoWidth;
  const h = video.videoHeight;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', w + 'px');
  canvas.setAttribute('height', h + 'px');
  const ctx = canvas.getContext('2d');

  if(ctx === null) return '';

  ctx.drawImage(video, w, h);

  return canvas.toDataURL();
}