export default function(stream) {
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();

  if(!capabilities.focusMode) {
    // alert('focusMode is not available');
    return;
  }

  track.applyConstraints({
    advanced: [{
      focusMode: 'continuous',
    }]
  });
}