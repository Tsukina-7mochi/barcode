const getConstraints = function() {
  const constraints = navigator.mediaDevices.getSupportedConstraints();

  return {
    focusMode: constraints.focusMode,
    focusDistance: constraints.focusDistance,
    zoom: constraints.zoom
  }
}

export {
  getConstraints
};