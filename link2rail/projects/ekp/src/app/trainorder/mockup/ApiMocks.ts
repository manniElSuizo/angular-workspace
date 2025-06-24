import { Supplier, SupplierResponse, WorkingDirection, WorkingDirectionsResponse } from "@src/app/trainorder/models/ApiModels";
import { CustomerProfile } from "@src/app/trainorder/models/authorization";
import { Tools } from "./tools";

export class ApiMocks {
    static supplierResponse(num = 5):SupplierResponse {
        return  this.suppliers(num)
    }

    static suppliers(num = 5): Supplier[] {
        const list: Supplier[] = [];
        for(let i = 0; i < num; i++) {
            list.push(this.supplier(Tools.randomString(Tools.randomNumber(8, 15))));
        }

        return list;
    }

    static supplier(name = 'test'): Supplier {
        return {uicCompanyCode: Tools.randomNumber(1000, 9999).toString(), name: name};
    }

    static workingDirectionResponse(): WorkingDirectionsResponse {
        return this.workingDirections();
    }

    static workingDirections():WorkingDirection[] {
        return [
            {code: '01', name: Tools.randomString(10)},
            {code: '02', name: Tools.randomString(10)},
            {code: '03', name: Tools.randomString(10)},
            {code: '04', name: Tools.randomString(10)},
            {code: '05', name: Tools.randomString(10)},
            {code: '06', name: Tools.randomString(10)},
            {code: '07', name: Tools.randomString(10)},
        ];
    }

    static customerProfile(str: string): CustomerProfile {
        return {
            partnerId: "123",
            sgvId: "321",
        }
    }

    static customerProfilesList(number:number): CustomerProfile[] {
        const profiles: CustomerProfile[] = [];
        for(let i = 0; i < number; i++) {
            profiles.push(this.customerProfile(Tools.randomString(7)))
        }
        return profiles;
    }
}
