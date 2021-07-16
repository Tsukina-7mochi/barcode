import pattern from '../patterns/code128/pattern.json';
import binaryToImageData from './binaryToImageData';

const calcCheckDigit = function(data: number[]): number {
  // start code
  let checkDigit = data[0];

  for(let i = 1; i < data.length; i++) {
    checkDigit = (checkDigit + data[i] * i) % 103;
  }
  return checkDigit;
}

export function code128(data: number[]) {
  const checkDigit = calcCheckDigit(data);

  let binary = '0000000000';
  for(const d of data) {
    binary += pattern[d].pattern;
  }

  binary += pattern[checkDigit].pattern;
  binary += pattern[106].pattern;
  binary += '0000000000';

  console.log(binary);

  return binaryToImageData(binary, 50);
}

export function code128C(data: number[]) {
  return code128([105, ...data]);
}