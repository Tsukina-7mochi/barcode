export default function(code: string): number {
  const len = code.length - 1;
  const numArr = code.slice(0, code.length - 1).split('').map(v => parseInt(v));
  const even = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 0 ? acc + cur : acc), 0);
  const odd  = numArr.reduce((acc, cur, i) => ((len - i) % 2 === 1 ? acc + cur : acc), 0);

  return (10 - (odd * 3 + even) % 10) % 10;
}