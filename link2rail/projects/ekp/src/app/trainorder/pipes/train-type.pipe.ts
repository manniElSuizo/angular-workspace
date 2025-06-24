import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'trainType'
})
export class TrainTypePipe implements PipeTransform {

  constructor(private translation: TranslateService) {}

  transform(value: unknown, ...args: unknown[]): string {
    if(value == 'SPECIAL_TRAIN') return this.translation.instant('train-SPECIAL_TRAIN');
    if(value == 'REGULAR_TRAIN') return this.translation.instant('train-REGULAR_TRAIN');
    return '-';
  }

}
