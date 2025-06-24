import { inject, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CustomsDescriptor } from "../../../models/rail-order-api";

@Injectable(
    {providedIn: 'root'}
)
export class CustomsDescriptorModel {
    private pCode: string;
    private pTranslation: string;

    constructor(code: CustomsDescriptor) {
        const translateService: TranslateService = inject(TranslateService);
        this.pCode = code;
        this.pTranslation = translateService.instant(`CustomsDescriptor.${code}`);
    }

    public get code() {
        return this.pCode;
    }

    public get translation() {
        return this.pTranslation;
    }
}
