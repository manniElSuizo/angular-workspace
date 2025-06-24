import {  Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wagonNumber'
})

export class WagonNumberPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    let output = (!value) ? null : (value + '').replace(/[^0-9]/g, '').slice(0, 12);
    if (output) {
      output = output.replace(/^(\d{4})(\d{4})(\d{3})(\d{1})$/g, '$1 $2 $3-$4');
    }
    return output;
  }
}
