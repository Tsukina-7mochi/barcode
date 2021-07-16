import pattern from '../patterns/code128/pattern.json';
import binaryToImageData from './binaryToImageData';

type pattern = {
  value: number,
  codeA: string,
  codeB: string,
  codeC: string | number,
  pattern: string
}

const calcCheckDigit = function(data: number[]): number {
  // start code
  let checkDigit = data[0];

  for(let i = 1; i < data.length; i++) {
    checkDigit = (checkDigit + data[i] * i) % 103;
  }
  return checkDigit;
}

const getChar = function(char: string | number, type: 'codeA' | 'codeB' | 'codeC'): pattern {
  const ptrn = pattern.find(ptrn => ptrn[type] === char);

  if(ptrn === undefined) {
    throw Error(`Unusable character: '${char}'`);
  }

  return ptrn;
}

export function code128(data: number[]) {
  const checkDigit = calcCheckDigit(data);

  let binary = '0'.repeat(10);
  for(const d of data) {
    binary += pattern[d].pattern;
  }

  binary += pattern[checkDigit].pattern;
  binary += pattern.find(ptrn => ptrn.codeA === "STOP")?.pattern;
  binary += '0'.repeat(10);

  console.log(binary);

  return binaryToImageData(binary, 50);
}

export function code128A(data: string) {
  const arr = data.split('').map(char => getChar(char, 'codeA').value);

  return code128([103, ...arr]);
}

export function code128B(data: string) {
  const arr = data.split('').map(char => getChar(char, 'codeB').value);

  return code128([104, ...arr]);
}

export function code128C(data: number[]) {
  const arr = data.map(num => getChar(num, 'codeC').value);

  return code128([105, ...arr]);
}
