import { Pipe, PipeTransform } from "@angular/core";
import { SgvSites } from "@src/app/trainorder/services/tok-internal-api.service";
import { customerSgvNameFormat } from "../constants/Constants";

@Pipe({
  name: 'sgvPipe'
})
export class SgvPipe implements PipeTransform {
    transform(value: SgvSites, ...args: any[]) {
        if(!value) return '';

        return customerSgvNameFormat.replace('$sgv', value.sgvId).replace('$name', value.customerName);
    }
}

@Pipe({
  name: 'sitePipe'
})
export class SitePipe implements PipeTransform {
    transform(value: {partnerId: string; siteName: string;}, ...args: any[]) {
        return customerSgvNameFormat.replace('$sgv', value.partnerId).replace('$name', value.siteName);
    }
}
