import { Pipe, PipeTransform } from '@angular/core';
import { RailAuthority } from '../../order-management/models/general-order';
import { railAuthorityFormat } from '@src/app/shared/constants/Constants';

@Pipe({
  name: 'railAuthority'
})
export class RailAuthorityPipe implements PipeTransform {

  transform(value: RailAuthority, ...args: unknown[]): string {
    if (!value) return '';
    return railAuthorityFormat.replace('$code', value.uicCompanyCode.toString()).replace('$abbr', value.abbreviation);
  }

}
