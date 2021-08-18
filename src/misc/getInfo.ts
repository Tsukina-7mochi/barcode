import Camera from "./camera";
import getInfoRaw from "./getInfoRaw";

const getStringInfo = async function(): Promise<string> {
  return getInfoRaw();
}

export {
  getStringInfo
};