import { Pipe, PipeTransform } from '@angular/core';
import { MarketSegment } from '@src/app/trainorder/models/ApiCustomers.model';
import { marketSegmentFormat } from '@src/app/shared/constants/Constants';

@Pipe({
  name: 'marketSegmentName'
})
export class MarketSegmentNamePipe implements PipeTransform {

  transform(value: MarketSegment|null|string, ...args: unknown[]): string|MarketSegment {
    if(value == null) return '';

    if(typeof value == 'string') {
      const endmarketareaCustomer = value.indexOf(') ');
      const marketareaCustomer = value.substring(1, endmarketareaCustomer);
      const name = value.substring(endmarketareaCustomer + 2);
      return {name: name, code: marketareaCustomer};
    }

    return marketSegmentFormat.replace('$marketSegment', value.code).replace('$name', value.name);
  }
}
