import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateOrderInternalStatus',
  standalone: false
})
export class TranslateOrderInternalStatusPipe implements PipeTransform {
  private readonly translationMap: { [key: string]: string } = {
    'WAITING': 'Shared.RailorderInternalStatus.WAITING',
    'TRANSMITTED': 'Shared.RailorderInternalStatus.TRANSMITTED',
    'EXPIRED': 'Shared.RailorderInternalStatus.EXPIRED',
    'CAPTURED': 'Shared.RailorderInternalStatus.CAPTURED',
    'SUBMITTED' : 'Shared.RailorderInternalStatus.SUBMITTED',
    'ACCEPTED': 'Shared.RailorderInternalStatus.ACCEPTED',
    'DRAFT': 'Shared.RailorderInternalStatus.DRAFT',
    'ACTIVE': 'Shared.RailorderInternalStatus.ACTIVE',
    'CLOSED': 'Shared.RailorderInternalStatus.CLOSED',
    'CANCELLED': 'Shared.RailorderInternalStatus.CANCELLED',
    'INVALID': 'Shared.RailorderInternalStatus.INVALID'
  };

  constructor(private translate: TranslateService) { }

  transform(value: string): string {
    const translationKey = this.translationMap[value];
    return translationKey ? this.translate.instant(translationKey) : value;
  }
}
