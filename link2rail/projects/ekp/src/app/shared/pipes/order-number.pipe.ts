import { Pipe, PipeTransform } from '@angular/core';
import { OrderNumberFilter } from '@src/app/order-management/models/general-order';
@Pipe({
  name: 'orderNumber'
})
export class OrderNumberPipe implements PipeTransform {

  transform(inOrderNumber: string | number, inAuthority: number = null): string {
    if (!inOrderNumber) {
      return null;
    }
    let orderAuthority = inAuthority;

    const arr = this.splitAuthority(inOrderNumber);
    let orderNumber = arr.orderNumber;
    if(!orderAuthority) {
      orderAuthority = arr.orderAuthority;
    }

    if (orderAuthority != null) {
      orderNumber = `${orderAuthority}${orderNumber}`;
    }

    // const formatPattern = orderAuthority != null ? /^(\d{2})(\d{8})(\d{3})(\d{4})$/ : /^(\d{8})(\d{3})(\d{4})$/;
    const formatPattern = orderAuthority != null ? /^(\d{2})(\d{8})(\d{3})(\d*)/ : /^(\d{8})(\d{3})(\d*)/;
    const formatReplacement = orderAuthority != null ? '$1 $2 $3 $4' : '$1 $2 $3';

    return orderNumber.replace(formatPattern, formatReplacement);
  }

  parse(value: string): string {
    return value.slice(0, 18).replace(/[^0-9]/g, '');
  }

  splitAuthority(value: string | number): OrderNumberFilter {
    const cleanValue = this.parse(value.toString());
    if(cleanValue.length < 17) {
      return {orderAuthority: null, orderNumber: cleanValue};
    }

    return {orderAuthority: Number(cleanValue.substring(0,2)), orderNumber: cleanValue.substring(2)};
  }
}
