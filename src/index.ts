import encode from './encoder/encoder';
import createImage from './createImage';
import decode from './decoder/decoder';

const getRadioValue = function(name: string): string | undefined {
  const inputs = <NodeListOf<HTMLInputElement>> document.querySelectorAll(`input[name=${name}]`);
  const element = Array.from(inputs).find(el => el.checked);

  return (element ? element.value : undefined);
}

// decode('00000000000101000101101001110010011001100101001110011011010101100110111001010001001010000101110010010001010000000');
// decode('00000000000101000101101001110110111000110101100110110011010101001110100001011011001011100111001010000101010000000');
decode('000000010100110010010011011110101000110101010011101010000100010011100101010000000')

window.addEventListener('load', () => {
  document.getElementById('start')?.addEventListener('click', () => {
    const code = (<HTMLInputElement>document.getElementById('code'))?.value;
    const type = getRadioValue('code-type');

    if(type === undefined) {
      console.error('The type is not selected');
      return;
    }
    if(type !== 'JAN' && type !== 'Code128-A' && type !== 'Code128-B' && type !== 'Code128-C') {
      console.error('Unsupported type: ' + type);
      return;
    }

    const img = createImage(encode(code, type));
    (<HTMLElement> document.querySelector('div#output')).innerHTML = '';
    document.querySelector('div#output')?.appendChild(img);
  });
});