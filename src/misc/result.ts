import calcEanCheckDigit from './calcEanCheckDigit';
import encode from '../encoder/encoder';
import createImage from './createImage';

const getResultElement = function() {
  const resultMessage = document.querySelector('main .result .message');
  const resultFail = document.querySelector('main .result .fail');
  const resultCode = document.querySelector('main .result .code');
  const resultEanCode = document.querySelector('main .result .ean-code .output');

  if(resultMessage === null) {
    throw Error('Element main .result .message is not defined');
  }
  if(resultFail === null) {
    throw Error('Element main .result .fail is not defined');
  }
  if(resultCode === null) {
    throw Error('Element main .result .code is not defined.');
  }
  if(resultEanCode === null) {
    throw Error('Element main .result .ean-code .output is not defined.');
  }

  return {
    resultMessage,
    resultFail,
    resultCode,
    resultEanCode
  }
}

const clearResult = function() {
  const { resultMessage, resultFail, resultCode, resultEanCode } = getResultElement();

  resultMessage.innerHTML = '';
  resultFail.innerHTML = '';
  resultCode.innerHTML = '';
  resultEanCode.innerHTML = '';
}

const setMessage = function(message: string) {
  const { resultMessage } = getResultElement();

  resultMessage.innerHTML = message;
}

const setFail = function(message: string) {
  const { resultFail } = getResultElement();

  resultFail.innerHTML = message;
}

const addEanCode = function(code: string) {
  const { resultEanCode } = getResultElement();
  const img = createImage(encode(code, 'JAN'));

  const wrapper = document.createElement('div');
  const codeStrDiv = document.createElement('div');
  codeStrDiv.textContent = code;

  wrapper.appendChild(img);
  wrapper.appendChild(codeStrDiv);
  resultEanCode.appendChild(wrapper);
}

const setCode = function(code: string) {
  const { resultCode } = getResultElement();

  resultCode.innerHTML = code;

  // extract ean code
  const detectEan = function(from: number, length: number) {
    const part = code.slice(from, from + length);
    if(calcEanCheckDigit(part) === parseInt(part.slice(-1))) {
      addEanCode(part);
    }
  }
  for(let i = 0; i <= code.length - 13; i++) {
    detectEan(i, 13);
  }
  for(let i = 0; i <= code.length - 8; i++) {
    detectEan(i, 8);
  }
}

const outputProgress = function(progress: 'reading') {
  clearResult();

  if(progress === 'reading') {
    setMessage('読み取り中...');
  }
}

const outputCode = function(code: string) {
  clearResult();

  setMessage('読み取り成功！');
  setCode(code);
}

const outputFail = function(reason: 'readerFailed' | 'cameraUnavailable' | 'canvasUnavailable') {
  clearResult();

  if(reason === 'readerFailed') {
    setMessage('読み取り失敗...');
    setFail(`
      <p>
        大きさ・角度・位置などを調整してもう一度撮ってみてください<br>
        曲がった面での読み取りは難しいです。どうしてもだめな場合は直接入力してください。
      </p>
    `);
  } else if(reason === 'cameraUnavailable') {
    setMessage('カメラを利用できません');
    setFail(`
      <p>
        カメラの権限が拒否されたか、アプリがカメラを利用できない可能性があります。
      </p>
    `);
  } else if(reason === 'canvasUnavailable') {
    setMessage('必要な機能を利用できません');
    setFail(`
      <p>
        お使いのブラウザは古いかもしれません。
      </p>
    `);
  }
}

export {
  outputProgress,
  clearResult,
  outputCode,
  outputFail
}