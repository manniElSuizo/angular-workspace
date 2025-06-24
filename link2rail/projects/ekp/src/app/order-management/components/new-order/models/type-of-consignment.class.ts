import { inject, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TypeOfConsignment } from "../../../models/rail-order-api";

@Injectable(
    {providedIn: 'root'}
)
export class TypeOfConsignmentModel {
    private pCode: string;
    private pTranslation: string;

    constructor(code: TypeOfConsignment) {
        const translateService: TranslateService = inject(TranslateService);
        this.pCode = code;
        this.pTranslation = translateService.instant(`TypeOfConsignment.${code}`);
    }

    public get code() {
        return this.pCode;
    }

    public get translation() {
        return this.pTranslation;
    }
}

// export const TYPES_OF_CONSIGNMENT: TypeOfConsignmentModel[] = [
//     new TypeOfConsignmentModel(TypeOfConsignment.CIM),
//     new TypeOfConsignmentModel(TypeOfConsignment.CUV),
//     new TypeOfConsignmentModel(TypeOfConsignment.NAT),
// ]