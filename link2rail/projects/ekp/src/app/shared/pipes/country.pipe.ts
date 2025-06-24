import { Pipe, PipeTransform } from '@angular/core';
import { Country } from '../../order-management/models/general-order';
import { countryFormat } from '@src/app/shared/constants/Constants';

@Pipe({
  name: 'country'
})
export class CountryPipe implements PipeTransform {

  transform(value: Country, ...args: unknown[]): unknown {
    return countryFormat.replace('$name', value.description).replace('$code', value.countryCode);
  }

}
