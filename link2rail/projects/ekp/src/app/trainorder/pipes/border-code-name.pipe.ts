import { Pipe, PipeTransform } from '@angular/core';
import {Border} from "../models/ApiModels";
import { borderCodeNameFormat } from '@src/app/shared/constants/Constants';

@Pipe({
  name: 'borderCodeAndName'
})
export class BorderCodeNamePipe implements PipeTransform {

  transform(value: Border|null|string, ...args: unknown[]): string|Border {
    if(value == null) return '';

    if(typeof value == 'string') {
      const endCode = value.indexOf(') ');
      const code = value.substring(1, endCode);
      const name = value.substring(endCode + 2);
      return {name: name, uicBorderCode: code};
    }

    return borderCodeNameFormat.replace('$sgv', value.uicBorderCode).replace('$name', value.name);
  }

}
