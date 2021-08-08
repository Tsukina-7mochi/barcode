import calcEanCheckDigit from './calcEanCheckDigit';
import encode from '../encoder/encoder';
import createImage from './createImage';

const getResultElement = function() {
  const resultMessage = document.querySelector('main .result .message');
  const resultFail = document.querySelector('main .result .fail');
  const resultCode = document.querySelector('main .result .code');
  const resultEanCode = document.querySelector('main .result .ean-code .output');
  const resultEanCodeWrapper = document.querySelector('main .result .ean-code');

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
  if(resultEanCodeWrapper === null) {
    throw Error('Element main .result .ean-code is not defined.');
  }

  return {
    resultMessage,
    resultFail,
    resultCode,
    resultEanCode,
    resultEanCodeWrapper
  }
}

interface setVisibilityOption {
  message?: boolean,
  fail?: boolean,
  code?: boolean,
  eanCode?: boolean
}
const setVisibility = function(option: setVisibilityOption) {
  const hideClassName = 'hidden';
  const { resultMessage, resultFail, resultCode, resultEanCodeWrapper } = getResultElement();

  if(Object.prototype.hasOwnProperty.call(option, 'message')) {
    if(option.message) {
      resultMessage.classList.remove(hideClassName);
    } else {
      resultMessage.classList.add(hideClassName);
    }
  }

  if(Object.prototype.hasOwnProperty.call(option, 'fail')) {
    if(option.fail) {
      resultFail.classList.remove(hideClassName);
    } else {
      resultFail.classList.add(hideClassName);
    }
  }

  if(Object.prototype.hasOwnProperty.call(option, 'code')) {
    if(option.code) {
      resultCode.classList.remove(hideClassName);
    } else {
      resultCode.classList.add(hideClassName);
    }
  }

  if(Object.prototype.hasOwnProperty.call(option, 'eanCode')) {
    if(option.eanCode) {
      resultEanCodeWrapper.classList.remove(hideClassName);
    } else {
      resultEanCodeWrapper.classList.add(hideClassName);
    }
  }
}

const clearResult = function() {
  const { resultMessage, resultFail, resultCode, resultEanCode } = getResultElement();

  resultMessage.innerHTML = '';
  resultFail.innerHTML = '';
  resultCode.innerHTML = '';
  resultEanCode.innerHTML = '';

  setVisibility({
    message: false,
    fail: false,
    code: false,
    eanCode: false
  });
}

const setMessage = function(message: string) {
  const { resultMessage } = getResultElement();

  resultMessage.innerHTML = message;

  setVisibility({
    message: true
  });
}

const setFail = function(message: string) {
  const { resultFail } = getResultElement();

  resultFail.innerHTML = message;

  setVisibility({
    fail: true
  });
}

const addEanCode = function(code: string) {
  const { resultEanCode } = getResultElement();
  try {
    const img = createImage(encode(code, 'JAN'));

    const wrapper = document.createElement('div');
    const codeStrDiv = document.createElement('div');
    codeStrDiv.textContent = code;

    wrapper.appendChild(img);
    wrapper.appendChild(codeStrDiv);
    resultEanCode.appendChild(wrapper);
  } catch(err) {
    console.error(err);
  }
}

const setCode = function(code: string, detectEan: boolean) {
  const { resultCode } = getResultElement();

  resultCode.innerHTML += code;

  setVisibility({
    code: true
  });

  if(detectEan) {
    // extract ean code
    const detect = function(from: number, length: number) {
    const part = code.slice(from, from + length);
      if(calcEanCheckDigit(part.slice(0, -1)) === parseInt(part.slice(-1))) {
        addEanCode(part);
      }
    }
    for(let i = 0; i <= code.length - 13; i++) {
      detect(i, 13);
    }
    for(let i = 0; i <= code.length - 8; i++) {
      detect(i, 8);
    }

    setVisibility({
      eanCode: true
    });
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
  setCode(code, true);
}

const manualOutputCode = function(code: string) {
  clearResult();

  setMessage('生成結果');
  setCode(code, false);
}

const outputFail = function(reason: 'readerFailed' | 'cameraUnavailable' | 'canvasUnavailable' | 'cameraDisconnected') {
  clearResult();

  if(reason === 'readerFailed') {
    setMessage('読み取り失敗...');
    setFail(`
      <ul>
        <li>
          バーコードが画面全体になるように撮影してください。
        </li>
        <li>
          暗い場所・曲がった面などでは検出が難しいです。手動入力をお試しください。
        </li>
      </ul>
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
  } else if(reason === 'cameraDisconnected') {
    setMessage('カメラが切断されました');
  }
}

const outputOCR = function(text: string) {
  clearResult();
  const { resultCode } = getResultElement();
  const result = text.replace(/ /g, '').split(/\n+/).map(str => str.trim()).filter(str => str.length > 0 );

  setMessage('読み取り結果');
  const ul = document.createElement('ul');
  result.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    ul.appendChild(li);
  });
  resultCode.appendChild(ul);

  setVisibility({
    code: true
  });
}

export {
  outputProgress,
  clearResult,
  outputCode,
  outputFail,
  manualOutputCode,
  outputOCR
}