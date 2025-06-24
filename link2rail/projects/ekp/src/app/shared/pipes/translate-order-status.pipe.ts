import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateOrderStatus',
  standalone: false
})
export class TranslateOrderStatusPipe implements PipeTransform {
  private readonly translationMap: { [key: string]: string } = {
    'CLOSED': 'Shared.RailorderStatus.CLOSED',
    'ACTIVE': 'Shared.RailorderStatus.ACTIVE',
    'SUBMITTED': 'Shared.RailorderStatus.SUBMITTED',
    'CANCELLED': 'Shared.RailorderStatus.CANCELLED',
    'ACCEPTED': 'Shared.RailorderStatus.ACCEPTED',
    'CAPTURED': 'Shared.RailorderStatus.CAPTURED',
    'INVALID': 'Shared. RailorderStatus.INVALID'
  };

  constructor(private translate: TranslateService) { }

  transform(value: string): string {
    const translationKey = this.translationMap[value];
    return translationKey ? this.translate.instant(translationKey) : value;
  }

}