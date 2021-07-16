import encode from "./encoder/encoder";
import createImage from "./createImage";

const getRadioValue = function(name: string): string | undefined {
  const inputs = <NodeListOf<HTMLInputElement>> document.querySelectorAll(`input[name=${name}]`);
  const element = Array.from(inputs).find(el => el.checked);

  return (element ? element.value : undefined);
}

window.addEventListener('load', () => {
  document.getElementById('start')?.addEventListener('click', () => {
    const code = (<HTMLInputElement>document.getElementById("code"))?.value;
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