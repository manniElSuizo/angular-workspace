import { VehicleSummaryForVehicleKeeper } from "../models/ApiWagonholderList.models";
// export const wagonkeeperInfo1 : WagonkeeperItem = {
//     wagonkeeper: 15308,
//     wagonnumber: "3387 7837 507-5",
//     wagoncategory: "Zans",
//     trackingstatus: "Übernahme",
//     trackingstatusdate: new Date("2024-06-11 16:00"),
//     country: "DE",
//     location: "Lingen",
//     runability: "0 - Uneingeschenkt Lauffähig",
//     damagecode: "Zuführung zur Wäsche"
// }

export class vehicleMocks {
    public static getVehicleKeeperSummaryForVehicleKeeper(s: string, n: number): VehicleSummaryForVehicleKeeper {
        const model: VehicleSummaryForVehicleKeeper = {
            vehicleNumber: "3387 7932 310-8",
            vehicleKeeperCode: (80000 + n) + "",
            internationalFreightWagonClass: "Zacens",
            nationalFreightWagonClass: "Zacens",
            seriesGroupNr: "seriesGroupNr " + s,
            typeOfConstruction: s,
            suitableForRunning: {
                code: (1+n) + "",
                description: "Darf nicht bewegt werden" + s
            },
            damageTypes: [{
                code: "damage Code" + s,
                description: "damage desc" + s
            }],
            lastStatus: {
                statusCode: "Übernahme",
                statusDescription: "Übernahme",
                statusDate: new Date("1977-08-04T12:00:00.000Z"),
                location: {
                    authority: "auth",
                    code: "de",
                    name: "Lingen",
                    country: {
                        code: "de",
                        name: "Deutschland"
                    }
                }
            }
        };
        return model;
    }

    public static getVehicleKeeperSummaryForVehicleKeeperList(length: number = 1, startWith: number = 1): VehicleSummaryForVehicleKeeper[] {
        const list = [];
        for (let index = 0; index < length; index++) {
            let s = vehicleMocks.alphabet[index];
            if(index > 25)
                s = vehicleMocks.alphabet[index % 26];
            list.push(vehicleMocks.getVehicleKeeperSummaryForVehicleKeeper(s, index + startWith));
        }
        return list;
    }

    public static alphabet = new Array( 26 ).fill( 1 ).map( ( _, i ) => String.fromCharCode( 'A'.charCodeAt(0) + i ) );
}

export const  mockWagonkeeperList1 : VehicleSummaryForVehicleKeeper[] = [vehicleMocks.getVehicleKeeperSummaryForVehicleKeeper('s', 1),vehicleMocks.getVehicleKeeperSummaryForVehicleKeeper('t', 2),vehicleMocks.getVehicleKeeperSummaryForVehicleKeeper('u', 3)];
export const  mockWagonkeeperList : VehicleSummaryForVehicleKeeper[] = vehicleMocks.getVehicleKeeperSummaryForVehicleKeeperList(40);