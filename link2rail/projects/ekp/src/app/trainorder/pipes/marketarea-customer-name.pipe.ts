import { Pipe, PipeTransform } from '@angular/core';
import { MarketAreaCustomer } from '@src/app/trainorder/models/ApiCustomers.model';
import { marketareaCustomerNameFormat } from '@src/app/shared/constants/Constants';

@Pipe({
  name: 'marketareaCustomerName'
})
export class MarketareaCustomerNamePipe implements PipeTransform {

  transform(value: MarketAreaCustomer|null|string, ...args: unknown[]): string|MarketAreaCustomer {
    if(value == null) return '';

    if(typeof value == 'string') {
      const endmarketareaCustomer = value.indexOf(') ');
      const marketareaCustomer = value.substring(1, endmarketareaCustomer);
      const name = value.substring(endmarketareaCustomer + 2);
      return {customerName: name, marketAreaCustomerNumber: marketareaCustomer};
    }

    return marketareaCustomerNameFormat.replace('$marketareaCustomer', value.marketAreaCustomerNumber).replace('$name', value.customerName);
  }

}
