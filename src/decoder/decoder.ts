import decodeJAN from './jan';
import decodeCode128 from './code128';

export default function decode(data: string) {
  return decodeJAN(data) || decodeCode128(data);
}