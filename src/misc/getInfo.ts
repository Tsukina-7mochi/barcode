import Camera from "./camera";
import { getConstraints } from "./getAdditionalInfo";

const getCamera = function(): Promise<[string, MediaStream | null]> {
  return new Promise((resolve) => {
    if(navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then((stream) => {
        resolve(['Available', stream]);
      }).catch((err) => {
        resolve([`Unavailable, ${err}`, null]);
      });
    } else {
      resolve(['mediaDevices.getUserMedia unavailable', null]);
    }
  });
}

const facingMode = function(stream: MediaStream, mode: string, exact: boolean): Promise<boolean> {
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

const _S = function(state: any) {
  return (state ? 'Available' : 'Unavailable');
}
const _SV = function(state: any) {
  return (state ? 'Valid' : 'Invalid');
}

const getInfo = async function() {
  const constraints = navigator.mediaDevices.getSupportedConstraints();
  const constraints2 = getConstraints();
  const [ cameraState, stream ] = await getCamera();

  console.log(stream?.getVideoTracks());


  return {
    appName: navigator.appCodeName,
    appVersion: navigator.appVersion,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    canvas: _S(document.createElement('canvas').getContext('2d') !== null),
    cameraState: cameraState,
    devices: (await navigator.mediaDevices.enumerateDevices()).map(v => `${v.label} (${v.deviceId}: ${v.kind})`).join(', '),
    tracks: (stream ? stream.getVideoTracks().map(v => `${v.id}[${v.enabled ? 'Enabled' : 'Disabled'}]`).join(', ') : ''),
    facingMode: _S(constraints.facingMode),
    facingModeEnv: _SV(stream ? await facingMode(stream, 'environment', false) : false),
    facingModeEnvExact: _SV(stream ? await facingMode(stream, 'environment', true) : false),
    facingModeUser: _SV(stream ? await facingMode(stream, 'user', false) : false),
    facingModeUserExact: _SV(stream ? await facingMode(stream, 'exact', false) : false),
    focusMode: _S(constraints2.focusMode),
    focusDistance: _S(constraints2.focusDistance),
    zoom: _S(constraints2.zoom)
  };
}

const getStringInfo = async function(): Promise<string> {
  const info = await getInfo();
  let str = '';

  const add = function(s: string) {
    str += s + '\n';
  }

  add(`appName: ${info.appName}`);
  add(`appVersion: ${info.appVersion}`);
  add(`userAgent: ${info.userAgent}`);
  add(`platform: ${info.platform}`);
  add(`canvas: ${info.canvas}`);
  add(`cameraState: ${info.cameraState}`);
  add(`devices: ${info.devices}`);
  add(`tracks: ${info.tracks}`);
  add(`facingMode: ${info.facingMode}`);
  add(`facingModeEnv: ${info.facingModeEnv}`);
  add(`facingModeEnvExact: ${info.facingModeEnvExact}`);
  add(`facingModeUser: ${info.facingModeUser}`);
  add(`facingModeUserExact: ${info.facingModeUserExact}`);
  add(`focusMode: ${info.focusMode}`);
  add(`focusDistance: ${info.focusDistance}`);
  add(`zoom: ${info.zoom}`);

  return str;
}

const getStringCameraInfo = function(camera: Camera) {
  let str = '';
  const add = function(s: string) {
    str += s + '\n';
  }

  add(`devices: ${camera.deviceIdList.join(', ')}`);
  add(`current device: ${camera.currendDeviceIndex}`);
  add(`facing mode: ${camera.currentFacingMode}`);

  return str;
}

export {
  getInfo,
  getStringInfo,
  getStringCameraInfo
};