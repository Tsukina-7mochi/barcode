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

const extractCodeFromString = function(str: string): string[] {
  const restult: string[] = [];

  const detect = function(from: number, length: number) {
    const part = str.slice(from, from + length);
    if(calcEanCheckDigit(part.slice(0, -1)) === parseInt(part.slice(-1))) {
      restult.push(part);
    }
  }

  for(let i = 0; i <= str.length - 13; i++) {
    detect(i, 13);
  }
  for(let i = 0; i <= str.length - 8; i++) {
    detect(i, 8);
  }

  return restult;
}

const outputProgress = function(progress: 'reading') {
  const { resultMessage } = getResultElement();

  clearResult();

  if(progress === 'reading') {
    resultMessage.textContent = '???????????????...';
    setVisibility({
      message: true
    })
  }
}

const outputCode = function(code: string) {
  const { resultMessage, resultCode, resultEanCode } = getResultElement();

  clearResult();

  resultMessage.textContent = '?????????????????????';
  resultCode.textContent = code;

  // detect ean code
  extractCodeFromString(code).forEach((eanCode) => {
    try {
      const img = createImage(encode(eanCode, 'JAN'));

      const wrapper = document.createElement('div');
      const codeStrDiv = document.createElement('div');
      codeStrDiv.textContent = eanCode;

      wrapper.appendChild(img);
      wrapper.appendChild(codeStrDiv);
      resultEanCode.appendChild(wrapper);
    } catch(err) {
      console.error(err);
    }
  });

  setVisibility({
    message: true,
    code: true,
    eanCode: true
  });
}

const manualOutputCode = function(code: string) {
  const { resultMessage, resultCode } = getResultElement();
  clearResult();

  resultMessage.textContent = '????????????';

  try {
    const img = createImage(encode(code, 'JAN'));

    const wrapper = document.createElement('div');
    const codeStrDiv = document.createElement('div');
    codeStrDiv.textContent = code;

    wrapper.appendChild(img);
    wrapper.appendChild(codeStrDiv);
    resultCode.appendChild(wrapper);
  } catch(err) {
    console.error(err);
  }

  setVisibility({
    message: true,
    code: true
  });
}

const outputFail = function(reason: 'readerFailed' | 'cameraUnavailable' | 'canvasUnavailable' | 'cameraDisconnected') {
  const { resultMessage, resultFail } = getResultElement();
  clearResult();

  if(reason === 'readerFailed') {
    resultMessage.textContent = '??????????????????...';
    resultFail.textContent = '????????????????????????????????????????????????????????????????????????????????????????????????????????????';
  } else if(reason === 'cameraUnavailable') {
    resultMessage.textContent = '?????????????????????????????????';
    resultFail.textContent = '???????????????????????????????????????????????????????????????????????????????????????????????????????????????'
  } else if(reason === 'canvasUnavailable') {
    resultMessage.textContent = '???????????????????????????????????????';
    resultFail.textContent = '?????????????????????????????????????????????????????????';
  } else if(reason === 'cameraDisconnected') {
    resultMessage.textContent = '????????????????????????????????????';
    resultFail.textContent = '????????????????????????????????????????????????????????????????????????';
  }

  setVisibility({
    message: true,
    fail: true
  })
}

const outputOCR = function(text: string) {
  clearResult();
  const { resultMessage, resultCode, resultEanCode } = getResultElement();
  const result = text.replace(/ /g, '').split(/\n+/).map(str => str.trim()).filter(str => str.length > 0 );

  resultMessage.textContent = '??????????????????';

  if(result.length > 0) {
    const ul = document.createElement('ul');
    result.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.appendChild(li);
    });
    resultCode.appendChild(ul);

    // detect ean code
    result.forEach((code) => {
      extractCodeFromString(code).forEach((eanCode) => {
        try {
          const img = createImage(encode(eanCode, 'JAN'));

          const wrapper = document.createElement('div');
          const codeStrDiv = document.createElement('div');
          codeStrDiv.textContent = eanCode;

          wrapper.appendChild(img);
          wrapper.appendChild(codeStrDiv);
          resultEanCode.appendChild(wrapper);
        } catch(err) {
          console.error(err);
        }
      });
    });
  } else {
    resultCode.textContent = '??????????????????????????????';
  }

  setVisibility({
    message: true,
    code: true,
    eanCode: true
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