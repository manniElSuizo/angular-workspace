import { inject, Pipe, PipeTransform } from "@angular/core";
import { DangerousGoodLaw } from "@src/app/order-management/models/general-order";
import { dangerousGoodLawFormat } from "../constants/Constants";
import { AppService } from "@src/app/app.service";

@Pipe({
    name: 'dangerousGoodLawPipe'
  })
  export class DangerousGoodLawPipe implements PipeTransform {

    transform(value: DangerousGoodLaw): string {
        if(value == null) return '';
        return dangerousGoodLawFormat.replace('$text', value.text);
    }
  }
