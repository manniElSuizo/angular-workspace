import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateWagonStatus'
})
export class TranslateWagonStatusPipe implements PipeTransform {
  private readonly translationMap: { [key: string]: string } = {
    'ARRIVAL': 'Shared.WagonTrackingEventType.ARRIVAL',
    'DEPARTURE': 'Shared.WagonTrackingEventType.DEPARTURE',
    'PASS_THROUGH': 'Shared.WagonTrackingEventType.PASSTHROUGH',
    'PASSTHROUGH': 'Shared.WagonTrackingEventType.PASSTHROUGH',
    'LOCATION_CHANGE': 'Shared.WagonTrackingEventType.LOCATION_CHANGE',
    'ACTIVATION': 'Shared.WagonTrackingEventType.ACTIVATION',
    'COMPLETION': 'Shared.WagonTrackingEventType.COMPLETION',
    'HANDOVER': 'Shared.WagonTrackingEventType.HANDOVER',
    'TAKEOVER': 'Shared.WagonTrackingEventType.TAKEOVER',
    'FORCEDCOMPLETION': 'Shared.WagonTrackingEventType.FORCEDCOMPLETION',
    'PARKING': 'Shared.WagonTrackingEventType.PARKING',
    'PRENOTIFICATION': 'Shared.WagonTrackingEventType.PRENOTIFICATION',
    'LOADING': 'Shared.WagonTrackingEventType.LOADING',
    'UNLOADING': 'Shared.WagonTrackingEventType.UNLOADING',
    'TRANSPORTSTART': 'Shared.WagonTrackingEventType.TRANSPORTSTART',
    'SHOCK': 'Shared.WagonTrackingEventType.SHOCK'
  };

  constructor(private translate: TranslateService) { }

  transform(value: string): string {
    const translationKey = this.translationMap[value];
    return translationKey ? this.translate.instant(translationKey) : value;
  }
}
