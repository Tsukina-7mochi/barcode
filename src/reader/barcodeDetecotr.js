let barcodeDetector = null;

const getBarcodeDetector = function() {
  if(Object.prototype.hasOwnProperty.call(globalThis, 'BarcodeDetector')) {
    if(!barcodeDetector) {
      barcodeDetector = new globalThis.BarcodeDetector({
        formats: ['code_128', 'ean_13', 'ean_8']
      });
    }
    return new barcodeDetector;
  }

  return null;
}

export { getBarcodeDetector };