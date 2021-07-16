import pattern from '../patterns/code128/pattern.json';
import debug from '../debug';

type pattern = {
  value: number,
  codeA: string,
  codeB: string,
  codeC: string | number,
  pattern: string
}

const getChar = function(char: string | number, type: 'codeA' | 'codeB' | 'codeC'): pattern {
  const ptrn = pattern.find(ptrn => ptrn[type] === char);

  if(ptrn === undefined) {
    throw Error(`Unusable character: '${char}'`);
  }

  return ptrn;
}

const calcCheckDigit = function(data: number[]): number {
  // start code
  let checkDigit = data[0];

  for(let i = 1; i < data.length; i++) {
    checkDigit = (checkDigit + data[i] * i) % 103;
  }
  return checkDigit;
}

const decode = function(binary_: string): string | undefined {
  let binary = binary_;

  let data = '';
  const value: number[] = [];
  const shiftTable = {
    codeA: 'codeB' as const,
    codeB: 'codeC' as const,
    codeC: 'codeA' as const
  }
  let readingCode: 'codeA' | 'codeB' | 'codeC' = 'codeA';
  let shifted = false;

  // start code
  const startA = getChar('START A', 'codeA');
  const startB = getChar('START B', 'codeA');
  const startC = getChar('START C', 'codeA');
  if(binary.startsWith(startA.pattern)) {
    binary = binary.slice(startA.pattern.length);
    value.push(startA.value);
    readingCode = 'codeA';
  } else if(binary.startsWith(startB.pattern)) {
    binary = binary.slice(startB.pattern.length);
    value.push(startB.value);
    readingCode = 'codeB';
  } else if(binary.startsWith(startC.pattern)) {
    binary = binary.slice(startC.pattern.length);
    value.push(startC.value);
    readingCode = 'codeC';
  } else {
    return;
  }

  // read data
  while(true) {
    let currentPtrn: pattern | undefined = undefined;
    debug.log(data, binary);

    for(const ptrn of pattern) {
      if(binary.startsWith(ptrn.pattern)) {
        currentPtrn = ptrn;
      }
    }

    // invalid pattern detected
    if(currentPtrn === undefined) {
      return;
    }

    value.push(currentPtrn.value);
    binary = binary.slice(currentPtrn.pattern.length);

    const currentData = (shifted ? currentPtrn[shiftTable[readingCode]] : currentPtrn[readingCode]);
    if(shifted) shifted = false;

    if(currentData === 'FNC 1') {
      // do nothing
    } else if(currentData === 'FNC 2') {
      // do nothing
    } else if(currentData === 'FNC 3') {
      // do nothing
    } else if(currentData === 'FNC 4') {
      // do nothing
    } else if(currentData === 'SHIFT') {
      shifted = true;
    } else if(currentData === 'CODE A') {
      readingCode = 'codeA';
    } else if(currentData === 'CODE B') {
      readingCode = 'codeB';
    } else if(currentData === 'CODE C') {
      readingCode = 'codeC';
    } else if(currentData === 'START A') {
      return;
    } else if(currentData === 'START B') {
      return;
    } else if(currentData === 'START C') {
      return;
    } else if(currentData === 'STOP') {
      break;
    } else {
      // normal character or number
      data += currentData;
    }
  }

  // remove tailing -1
  value.pop();

  debug.log(data);
  debug.log(value);

  const checkDigit = value.pop();
  if(calcCheckDigit(value) !== checkDigit) return;

  debug.log('result: ' + data.slice(0, -1));

  return data.slice(0, -1);
}

export default function code128(binary: string): string | undefined {
  const part = binary.split(/0{10,}/);

  for(const p of part) {
    const result = decode(p);
    if(result) return result;
  }

  return;
}