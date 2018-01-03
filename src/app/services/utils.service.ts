import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  constructor() { }

  createArray(lengths: number[]) {
    const arr = new Array(lengths[0] || 0);
    let i = arr.length;
    if (lengths.length > 1) {
      const args = lengths.slice(1, lengths.length);
      while (i--) {
        arr[length - 1 - i] = this.createArray.apply(this, args);
      }
    }

    return arr;

  }
}
