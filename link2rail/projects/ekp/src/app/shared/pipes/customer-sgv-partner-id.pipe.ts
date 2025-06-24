import { Pipe, PipeTransform } from '@angular/core';
import { CustomerData } from '@src/app/trainorder/models/authorization';
import { customerSgvPartnerId } from '../constants/Constants';

@Pipe({
  name: 'customerSgvPartnerId'
})
export class CustomerSgvPartnerIdPipe implements PipeTransform {

  transform(value: CustomerData, ...args: unknown[]): string {
    if(value == null) {
      return '';
    }
    return customerSgvPartnerId.replace("$customerName", value.customerName).replace("$sgvId", value.sgvId).replace("$siteName", value.siteName).replace("$partnerId", value.partnerId);
  }

}
