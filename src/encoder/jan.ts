import binaryToImageData from "./binaryToImageData";
import pattern from '../patterns/jan/pattern.json';

const calcCheckDigit = function(code: string): number {
  const len = code.length - 1;
  const numArr = code.slice(0, code.length - 1).split('').map(v => parseInt(v));
  const even = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 0 ? acc + cur : acc), 0);
  const odd  = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 1 ? acc + cur : acc), 0);

  return (10 - (odd * 3 + even) % 10) % 10;
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
    binary += '0'.repeat(11);

    // left guard bar
    binary += '101';

    // left data bar
    for(let i = 0; i < 6; i++) {
      if(pattern[prefix].parity[i] == 'O') {
        binary += pattern[parseInt(left[i])]["left-odd"];
      } else {
        binary += pattern[parseInt(left[i])]["left-even"];
      }
    }

    // center bar
    binary += '01010';

    // right data bar
    for(let i = 0; i < 6; i++) {
      binary += pattern[parseInt(right[i])]["right"];
    }

    // right guard bar
    binary += '101';

    // right margin
    binary += '0'.repeat(7);
  } else {
    const left = code.slice(0, 4);
    const right = code.slice(4);

    // left margin
    binary += '0000000';

    // left guard bar
    binary += '101';

    // left data bar
    for(let i = 0; i < 4; i++) {
      binary += pattern[parseInt(left[i])]["left-odd"];
    }

    // center bar
    binary += '01010';

    // right data bar
    for(let i = 0; i < 4; i++) {
      binary += pattern[parseInt(right[i])]["right"];
    }

    // right guard bar
    binary += '101';

    // right margin
    binary += '0000000';
  }

  return binaryToImageData(binary, 50);
}