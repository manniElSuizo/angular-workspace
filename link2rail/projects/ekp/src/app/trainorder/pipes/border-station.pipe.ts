import { Pipe, PipeTransform } from '@angular/core';
import { Border } from '@src/app/trainorder/models/ApiModels';

@Pipe({
  name: 'borderStationPipe'
})
export class BorderStationPipe implements PipeTransform {

  transform(value: string[] | Border[] | undefined | null, ...args: unknown[]): unknown {
    if(!value) return '';
    if(value instanceof Array && value.length > 0 && typeof value[0] == 'string')
      return value.join(", ");

    let arr: string[] = [];

    value.forEach((e) => {
      if(e.hasOwnProperty('uicBorderCode')) {
        arr.push('(' + (e as Border).uicBorderCode + ') ' + (e as Border).name);
      } else {
        arr.push(e as string);
      }
    });

    return arr.join(', ');
  }

}
