export default class Generator {
  type: 'JAN';

  constructor(type: string) {
    if(type !== 'JAN') {
      throw new Error('The type must be JAN');
    }

    this.type = type;
  }

  generate(code: string) {
    if(this.type === 'JAN') {
      if(!/^\d{13}$/.test(code)) {
        throw new Error("invalid code: " + code);
      }
    }
  }
}