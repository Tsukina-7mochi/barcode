const getCamera = function() {
  return new Promise((resolve) => {
    if(navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then((stream) => {
        resolve([true, stream]);
      }).catch((err) => {
        resolve([false, null]);
      });
    } else {
      resolve([false, null]);
    }
  });
}

const testFacingMode = function(stream, mode, exact) {
  return new Promise((resolve) => {
    const track = stream.getTracks()[0];

    if(!track) {
      resolve(false);
    }

    if(exact) {
      track.applyConstraints({
        facingMode: { exact: mode }
      }).then(() => {
        resolve(track.getConstraints().facingMode === mode);
      }).catch(() => {
        resolve(false);
      });
    }

    track.applyConstraints({
      facingMode: mode
    }).then(() => {
      resolve(track.getConstraints().facingMode === mode);
    }).catch(() => {
      resolve(false);
    });
  });
}

const getInfoRaw = async function() {
  const [ cameraState_, stream ] = await getCamera();
  const constraints = navigator.mediaDevices.getSupportedConstraints();
  const formats = Object.prototype.hasOwnProperty.call(globalThis, 'BarcodeDetector') ? await BarcodeDetector?.getSupportedFormats() : [];

  let result = '';
  try {
    const appName = navigator.appCodeName;
    result += `appName: ${appName}\n`;

    const appVersion = navigator.appVersion;
    result += `appVersion: ${appVersion}\n`;

    const userAgent = navigator.userAgent;
    result += `userAgent: ${userAgent}\n`;

    const platform = navigator.platform;
    result += `platform: ${platform}\n`

    const canvas = document.createElement('canvas').getContext('2d') !== null;
    result += `canvas: ${canvas}\n`;

    const cameraState = cameraState_;
    result += `cameraState: ${cameraState}\n`;

    const devices = await navigator.mediaDevices?.enumerateDevices();
    result += `devices: ${devices?.map(v => `${v.label} (${v.deviceId}: ${v.kind})`)?.join(', ')}\n`;

    const tracks = stream && stream.getVideoTracks();
    result += `tracks: ${tracks?.map(v => `${v.id}[${v.enabled ? 'Enabled' : 'Disabled'}]`).join(', ')}\n`

    const facingMode = constraints.facingMode;
    result += `facingMode: ${facingMode}\n`;

    const facingModeEnv = stream ? await testFacingMode(stream, 'environment', false) : false;
    const facingModeEnvExact = stream ? await testFacingMode(stream, 'environment', true) : false;
    result += `facingModeEnv: ${facingModeEnv} / ${facingModeEnvExact}\n`;

    const facingModeUser = stream ? await testFacingMode(stream, 'user', false) : false;
    const facingModeUserExact = stream ? await testFacingMode(stream, 'exact', false) : false;
    result += `facingModeUser: ${facingModeUser} / ${facingModeUserExact}\n`;

    const focusMode = constraints.focusMode;
    result += `focusMode: ${focusMode}\n`;

    const focusDistance = constraints.focusDistance;
    result += `focusDistance: ${focusDistance}\n`;

    const zoom = constraints.zoom;
    result += `zoom: ${zoom}\n`;

    const barcodeDetector = Object.prototype.hasOwnProperty.call(globalThis, 'BarcodeDetector');
    result += `BarcodeDetector: ${barcodeDetector}\n`;

    const code128 = formats.includes('code_128');
    result += `code128: ${code128}\n`;

    const ean13 = formats.includes('ean_13');
    result += `ean13: ${ean13}\n`;

    const ean8 = formats.includes('ean_8');
    result += `ean8: ${ean8}\n`;

  } catch(err) {
    console.log(err);
  }

  return result;
}

export default getInfoRaw;