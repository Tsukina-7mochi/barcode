import Quagga from 'quagga';
import { getBarcodeDetector } from './barcodeDetecotr';
import urlToImageData from '../misc/urlToImageData';

export default function reader(imageUrl: string): Promise<string> {
  const barcodeDetector = getBarcodeDetector();
  if(barcodeDetector) {
    return urlToImageData(imageUrl).then((imageData) => {
      const result = barcodeDetector.detect(imageData);

      if(result?.rawValue) {
        return <string> result.rawValue;
      }
      throw 'NOT_DETECTED';
    });
  }

  return new Promise((resolve, reject) => {
    Quagga.decodeSingle({
      decoder: {
        readers: ['code_128_reader', 'ean_reader']
      },
      locate: true,
      src: imageUrl
    }, (result) => {
      if(result?.codeResult?.code) {
        resolve(result.codeResult.code);
      } else {
        reject('NOT_DETECTED');
      }
    });
  });
}