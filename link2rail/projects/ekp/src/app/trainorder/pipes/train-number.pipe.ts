import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trainNumber'
})
export class TrainNumberPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {

    switch(args[0]) {
      case 'train-number': { return '' };
      case 'client-reference': { return '' };
      default: return '-'
    }
  }

}
