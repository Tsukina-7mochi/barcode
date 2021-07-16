import pattern from '../patterns/jan/pattern.json';

const calcCheckDigit = function(code: string): number {
  const len = code.length - 1;
  const numArr = code.slice(0, code.length - 1).split('').map(v => parseInt(v));
  const even = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 0 ? acc + cur : acc), 0);
  const odd  = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 1 ? acc + cur : acc), 0);

  return (10 - (odd * 3 + even) % 10) % 10;
}

export default function JAN(binary: string): string | undefined {
  const part = binary.split(/0{7,}/);

  console.log(part);


  for(const p of part) {
    const result13 = length13(p);
    if(result13) return result13;

    const result8 = length8(p);
    if(result8) return result8;
  }

  return;
}

function length13(binary_: string): string | undefined {
  let binary = binary_;

  // left margin
  if(!binary.startsWith('101')) return;
  binary = binary.slice(3);
  console.log(binary);

  // left data
  const leftData: string[] = [];
  for(let i = 0; i < 6; i++) {
    leftData.push(binary.slice(0, 7));
    binary = binary.slice(7);
  }
  console.log(binary);

  // center bar
  if(!binary.startsWith('01010')) return;
  binary = binary.slice(5);

  // right data
  const rightData: string[] = [];
  for(let i = 0; i < 6; i++) {
    rightData.push(binary.slice(0, 7));
    binary = binary.slice(7);
  }
  console.log(binary);

  // right gurad bar
  if(!binary.startsWith('101')) return;
  binary = binary.slice(3);

  // right margin
  // do nothing

  console.log(leftData);
  console.log(rightData);

  const leftMatch = leftData.map(d => {
    const le = pattern.find(ptrn => ptrn['left-even'] === d);
    const lo = pattern.find(ptrn => ptrn['left-odd'] === d);

    if(le) {
      return { parity: 'E', num: le.value }
    } else if(lo) {
      return { parity: 'O', num: lo.value }
    }

    return;
  });
  console.log(leftMatch);
  if(leftMatch.some(m => m === undefined)) return;

  const parityPattern = leftMatch.map(m => m?.parity).join('');
  console.log(parityPattern);

  const prefix = pattern.findIndex(ptrn => ptrn.parity === parityPattern);
  if(prefix === -1) return;

  const left = leftMatch.map(m => m?.num).join('');
  console.log(left);

  if(!rightData.every(d => pattern.some(ptrn => ptrn.right === d))) return;
  const right = rightData.map(d => pattern.find(ptrn => ptrn.right === d)?.value).join('');
  console.log(right);

  console.log(prefix + left + right);

  const result = prefix + left + right;

  if(parseInt(right) % 10 !== calcCheckDigit(result)) return;

  return result;
}

function length8(binary_: string): string | undefined {
  let binary = binary_;

  // left margin
  if(!binary.startsWith('101')) return;
  binary = binary.slice(3);
  console.log(binary);

  // left data
  const leftData: string[] = [];
  for(let i = 0; i < 4; i++) {
    leftData.push(binary.slice(0, 7));
    binary = binary.slice(7);
  }
  console.log(binary);

  // center bar
  if(!binary.startsWith('01010')) return;
  binary = binary.slice(5);

  // right data
  const rightData: string[] = [];
  for(let i = 0; i < 4; i++) {
    rightData.push(binary.slice(0, 7));
    binary = binary.slice(7);
  }
  console.log(binary);

  // right gurad bar
  if(!binary.startsWith('101')) return;
  binary = binary.slice(3);

  // right margin
  // do nothing

  console.log(leftData);
  console.log(rightData);

  if(!leftData.every(d => pattern.some(ptrn => ptrn['left-odd'] === d))) return;
  const left = leftData.map(d => pattern.find(ptrn => ptrn['left-odd'] === d)?.value).join('');
  console.log(left);

  if(!rightData.every(d => pattern.some(ptrn => ptrn.right === d))) return;
  const right = rightData.map(d => pattern.find(ptrn => ptrn.right === d)?.value).join('');
  console.log(right);

  console.log(left + right);

  const result = left + right;

  if(parseInt(right) % 10 !== calcCheckDigit(result)) return;

  return result;
}