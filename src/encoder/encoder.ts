import generateJAN from './jan';
import {
  code128A as generateCode128A,
  code128B as generateCode128B,
  code128C as generateCode128C,
 } from './code128';

type Code128 = 'Code128-A' | 'Code128-B' | 'Code128-C'

export default function encode(data: string, type: 'JAN' | Code128): ImageData {
  if(type === 'JAN') {
    if(!/^(\d{13})|(\d{8})$/.test(data)) {
      throw new Error('invalid code of JAN: ' + data);
    }

    return generateJAN(data);
  } else if(type === 'Code128-A') {
    return generateCode128A(data);
  } else if(type === 'Code128-B') {
    return generateCode128B(data);
  } else if(type === 'Code128-C') {
    if(data.length % 2 !== 0) {
      throw new Error('Invalid data of Code128-C in length: ' + data.length + ' (' + data + ')');
    }

    const numArr = Array.from(data.matchAll(/\d\d/g)).map( v => parseInt(v[0]));
    return generateCode128C(numArr);
  }

  throw new Error('Unsupported type: ' + type);
}
