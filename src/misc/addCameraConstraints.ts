import setFocusMode from "./setFocusMode";

const setFacingMode = function(track: MediaStreamTrack, mode: 'environment' | 'user') {
  console.log(`switch to ${mode}`);

  track.applyConstraints({
    facingMode: { exact: mode }
  }).catch(() => {
    track.applyConstraints({
      facingMode: mode
    });
  }).catch(() => {
    console.info(`Cannnot set facing mode to ${mode}.`);
  });
}

export function addCameraConstraints(stream: MediaStream) {
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();

  if(capabilities.facingMode) {
    setFacingMode(track, 'environment');
  }

  setFocusMode(stream);
}

let facingModeFlag = false;
export function switchFacingMode(stream: MediaStream): boolean {
  const track = stream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();

  if(capabilities.facingMode) {
    // Use facing mode flag instead of detecting current facing mode
    // To explicitly switch between environment and user

    // const constraints = track.getConstraints();
    // if(constraints.facingMode) {
    //   if(constraints.facingMode === 'environment') {
    //     setFacingMode(track, 'environment');
    //   } else {
    //     setFacingMode(track, 'user');
    //   }
    // } else {
    //   setFacingMode(track, 'environment');
    // }

    if(facingModeFlag) {
      setFacingMode(track, 'environment');
    } else {
      setFacingMode(track, 'user');
    }
    facingModeFlag = !facingModeFlag;
  }

  return facingModeFlag;
}