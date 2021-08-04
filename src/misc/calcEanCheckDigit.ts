// Note that this funciton expects the code excepts check digit (length = 12 or 7)
export default function(code: string): number {
  const len = code.length;
  const numArr = code.split('').map(v => parseInt(v));
  const even = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 0 ? acc + cur : acc), 0);
  const odd  = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 1 ? acc + cur : acc), 0);

  return (10 - (odd * 3 + even) % 10) % 10;
}