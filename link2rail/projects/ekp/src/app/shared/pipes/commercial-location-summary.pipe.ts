import { Pipe, PipeTransform } from '@angular/core';
import { BorderAndCommercialLocationSummary } from '@src/app/order-management/models/rail-order-api';
import { CommercialLocationSummary } from '@src/app/order-management/models/general-order';

@Pipe({
  name: 'commercialLocationSummary'
})
export class CommercialLocationSummaryPipe implements PipeTransform {

  transform(commercialLocationSummary: CommercialLocationSummary | BorderAndCommercialLocationSummary): string {
    if(!commercialLocationSummary) {
      return null;
    }

    const code = commercialLocationSummary.uicBorderCode ? `${commercialLocationSummary.uicBorderCode}` : commercialLocationSummary.locationCode;

    return `${commercialLocationSummary.name} (${code})`;
  }

}
