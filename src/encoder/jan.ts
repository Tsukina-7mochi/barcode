import binaryToImageData from "./binaryToImageData";

const calcCheckDigit = function(code: string): number {
  const numArr = code.slice(0, code.length - 2).split('').map(v => parseInt(v));
  const even = numArr.reduce((acc, cur, i) => (i % 2 === 0 ? acc + cur : acc), 0);
  const odd  = numArr.reduce((acc, cur, i) => (i % 2 === 1 ? acc + cur : acc), 0);

  return (10 - (odd * 3 + even) % 10) % 10;
}

// parity combination used for 13-digit JAN
// O: odd parity, E: even parity
const dataPattern = [
  'OOOOOO',
  'OOEOEE',
  'OOEEOE',
  'OOEEEO',
  'OEOOEE',
  'OEEOOE',
  'OEEEOO',
  'OEOEOE',
  'OEOEEO',
  'OEEOEO'
];
// character format
const dataChar = {
  leftOdd: [
    '0001101',
    '0011001',
    '0010011',
    '0111101',
    '0100011',
    '0110001',
    '0101111',
    '0111011',
    '0110111',
    '0001011'
  ],
  leftEven: [
    '0100111',
    '0110011',
    '0011011',
    '0100001',
    '0011101',
    '0111001',
    '0000101',
    '0010001',
    '0001001',
    '0010111'
  ],
  right: [
    '1110010',
    '1100110',
    '1101100',
    '1000010',
    '1011100',
    '1001110',
    '1010000',
    '1000100',
    '1001000',
    '1110100'
  ]
}

export default function JAN(code: string): ImageData {
  const checkDigit = calcCheckDigit(code);
  if(parseInt(code[code.length - 1]) !== checkDigit) {
    throw new Error('Invalid JAN code: ' + code);
  }

  let binary = '';
  if(code.length == 13) {
    const prefix = parseInt(code[0]);
    const left = code.slice(1, 7);
    const right = code.slice(7);

    // left margin
    binary += '00000000000';

    // left gard bar
    binary += '101';

    // left data bar
    for(let i = 0; i < 6; i++) {
      if(dataPattern[prefix][i] == 'O') {
        binary += dataChar.leftOdd[parseInt(left[i])];
      } else {
        binary += dataChar.leftEven[parseInt(left[i])];
      }
    }

    // center bar
    binary += '01010';

    // right data bar
    for(let i = 0; i < 6; i++) {
      binary += dataChar.right[parseInt(right[i])];
    }

    // right gard bar
    binary += '101';

    // right margin
    binary += '0000000';
  } else {
    const left = code.slice(0, 5);
    const right = code.slice(5);

    // left margin
    binary += '0000000';

    // left gard bar
    binary += '101';

    // left data bar
    for(let i = 0; i < 6; i++) {
      binary += dataChar.leftOdd[parseInt(left[i])];
    }

    // center bar
    binary += '01010';

    // right data bar
    for(let i = 0; i < 6; i++) {
      binary += dataChar.right[parseInt(right[i])];
    }

    // right gard bar
    binary += '101';

    // right margin
    binary += '0000000';
  }

  console.log(binary);

  return binaryToImageData(binary, 50);
}