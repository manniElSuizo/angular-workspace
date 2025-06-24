import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trainId'
})
export class TrainIdPipe implements PipeTransform {

  /**
   * 
   * @param value 
   * @param args 
   * @returns 
   */
  transform(value: string, ...args: unknown[]): unknown {
    let coreElement = (value && value.length == 24  ? value.substring(6, 18) : '-');
    return coreElement;
  }

}
