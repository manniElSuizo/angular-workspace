import { Pipe, PipeTransform } from '@angular/core';
import { Customer, Site } from '@src/app/trainorder/models/ApiCustomers.model';
import { customerSgvNameFormat } from '../constants/Constants';

@Pipe({
  name: 'customerSgvName'
})
export class CustomerSgvNamePipe implements PipeTransform {

  transform(value: Customer|null|string|Site, ...args: unknown[]): string|Customer {
    if(value == null) return '';

    if((value as Site).partnerId && !(value as Customer).sgvNumber) {
      return this.transformPartnerId(value as Site);
    }

    if(typeof value == 'string') {
      const endSgv = value.indexOf(') ');
      const sgv = value.substring(1, endSgv);
      const name = value.substring(endSgv + 2);
      return {name: name, sgvNumber: sgv};
    }

    return customerSgvNameFormat.replace('$sgv', (value as Customer).sgvNumber).replace('$name', (value as Customer).name);
  }

  private transformPartnerId(value: Site): string {
    return customerSgvNameFormat.replace('$sgv', value.partnerId).replace('$name', value.name);
  }

  public reverse(formattedString: string): Customer {
    const arr = formattedString.split(' ');

    // Ensure that there are at least two parts: one for the sgvNumber and one for the name
    if (arr.length < 2) {
        throw 'Error in using unformatting CustomerSgvName';
    }

    // Extract the sgvNumber from the first part (removing the leading and trailing characters)
    const sgv = arr[0].substring(1, arr[0].length - 1);

    // Join all the remaining parts of the array (after the first element) as the name
    const name = arr.slice(1).join(' ');  // Join all elements after the first space to form the name

    // Create the Customer object
    const c: Customer = { name: name, sgvNumber: sgv };
    return c;
}

}
