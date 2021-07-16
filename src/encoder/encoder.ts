import generateJAN from "./jan";
import { code128C as generateCode128C } from "./code128";

export default function encode(code: string, type: "JAN" | "Code128-C"): ImageData {
  if(type === "JAN") {
    if(!/^(\d{13})|(\d{8})$/.test(code)) {
      throw new Error("invalid code of JAN: " + code);
    }

    return generateJAN(code);
  } else if(type === "Code128-C") {
    if(code.length % 2 !== 0) {
      throw new Error("Invalid code of Code128-C in length: " + code.length + " (" + code + ")");
    }

    const numArr = Array.from(code.matchAll(/\d\d/g)).map( v => parseInt(v[0]));
    return generateCode128C(numArr);
  }

  throw new Error("Unsupported type: " + type);
}
