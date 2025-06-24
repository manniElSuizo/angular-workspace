import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'suitableForRunning',
  standalone: false
})
export class SuitableForRunningPipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(value: string): string {
    switch (value) {
      case '0': 
        return this.translateService.instant('Shared.SuitableForRunnigType.Fully-operational');
      case '1':
        return this.translateService.instant('Shared.SuitableForRunnigType.Immediate-repair-needed');
      case '2':
        return this.translateService.instant('Shared.SuitableForRunnigType.Immediate_unloading-needed');
      case '3':
        return this.translateService.instant('Shared.SuitableForRunnigType.Limited-operational-mws');
      case '4':
        return this.translateService.instant('Shared.SuitableForRunnigType.Must-not-be-moved');
      case '5':
        return this.translateService.instant('Shared.SuitableForRunnigType.Limited-operational');
      case '6':
        return this.translateService.instant('Shared.SuitableForRunnigType.Restricted-operational');
      default:
        return value;
    }
  }
}