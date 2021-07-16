import pattern from '../patterns/jan/pattern.json';

// 13 と 8 で別々にする
export default function JAN(binary: string): string | undefined {
  return length13(binary) || length8(binary);
}

function length13(binary_: string): string | undefined {
  let binary = binary_;

  // left margin
  const leftMargin = binary.search('0'.repeat(11) + '101');
  binary = binary.slice(leftMargin + 14);
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

  return prefix + left + right;
}

function length8(binary_: string): string | undefined {
  let binary = binary_;

  // left margin
  const leftMargin = binary.search('0'.repeat(7) + '101');
  binary = binary.slice(leftMargin + 10);
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

  return left + right;
}