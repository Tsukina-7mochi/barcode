import Quagga from 'quagga';

export default function reader(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    Quagga.decodeSingle({
      decoder: {
        readers: ['code_128_reader', 'ean_reader']
      },
      locate: true,
      src: imageUrl
    }, (result) => {
      if(result.codeResult) {
        resolve(result.codeResult.code);
      } else {
        reject('NOT_DETECTED');
      }
    });
  });
}