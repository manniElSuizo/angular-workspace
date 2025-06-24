import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {

  constructor(private translate: TranslateService) { }
  transform(value: Date | any, ...args: any[]): string {
    if (!value) {
      return '';
    }
    if (typeof (value) == 'string') {
      value = new Date(value);
    }
    let day: number | string = value.getDate();
    let month: number | string = value.getMonth() + 1;
    let year = value.getFullYear();
    let hours: number | string = value.getHours();
    let minutes: number | string = value.getMinutes();

    day = day.toString().length === 1 ? '0' + day : day;
    month = month.toString().length === 1 ? '0' + month : month;
    hours = hours.toString().length === 1 ? '0' + hours : hours;
    minutes = minutes.toString().length === 1 ? '0' + minutes : minutes;

    switch (args[0]) {
      case 'HH:MM': return `${hours}:${minutes}`;
      case 'shortTime': return `${hours}:${minutes} ${this.translate.instant('Shared.Hour-label')}`;
      case 'shortDate': return `${day}.${month}.${year}`;
      case 'separated': return `${day}.${month}.${year} | ${hours}:${minutes} ${this.translate.instant('Shared.Hour-label')}`;
      default: return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
  }

}
