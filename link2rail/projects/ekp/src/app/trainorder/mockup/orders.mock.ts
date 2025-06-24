import { ApiOrdersListRequest, ApiOrdersListResponse, OrderItem } from "@src/app/trainorder/models/ApiOrders.model";
export interface Country {
  countryCode: string;
  description: string;
  uicCountryCode: number;
}

export const countriesMock: Country[] = [
  { countryCode: "AL", description: "Albanien", uicCountryCode: 41 },
  { countryCode: "AD", description: "Andorra", uicCountryCode: 271 },
  { countryCode: "AM", description: "Armenien", uicCountryCode: 58 },
  { countryCode: "AT", description: "Österreich", uicCountryCode: 81 },
  { countryCode: "AZ", description: "Aserbaidschan", uicCountryCode: 57 },
  { countryCode: "BY", description: "Weißrussland", uicCountryCode: 21 },
  { countryCode: "BE", description: "Belgien", uicCountryCode: 88 },
  { countryCode: "BA", description: "Bosnien und Herzegowina", uicCountryCode: 49 },
  { countryCode: "BG", description: "Bulgarien", uicCountryCode: 52 },
  { countryCode: "HR", description: "Kroatien", uicCountryCode: 78 },
  { countryCode: "CY", description: "Zypern", uicCountryCode: 214 },
  { countryCode: "CZ", description: "Tschechien", uicCountryCode: 54 },
  { countryCode: "DK", description: "Dänemark", uicCountryCode: 86 },
  { countryCode: "DE", description: "Deutschland", uicCountryCode: 80 },
  { countryCode: "EE", description: "Estland", uicCountryCode: 48 },
  { countryCode: "FI", description: "Finnland", uicCountryCode: 10 },
  { countryCode: "FR", description: "Frankreich", uicCountryCode: 87 },
  { countryCode: "GE", description: "Georgien", uicCountryCode: 58 },
  { countryCode: "GR", description: "Griechenland", uicCountryCode: 73 },
  { countryCode: "HU", description: "Ungarn", uicCountryCode: 55 },
  { countryCode: "IS", description: "Island", uicCountryCode: 304 },
  { countryCode: "IE", description: "Irland", uicCountryCode: 272 },
  { countryCode: "IT", description: "Italien", uicCountryCode: 83 },
  { countryCode: "KZ", description: "Kasachstan", uicCountryCode: 29 },
  { countryCode: "LV", description: "Lettland", uicCountryCode: 48 },
  { countryCode: "LI", description: "Liechtenstein", uicCountryCode: 813 },
  { countryCode: "LT", description: "Litauen", uicCountryCode: 47 },
  { countryCode: "LU", description: "Luxemburg", uicCountryCode: 82 },
  { countryCode: "MK", description: "Nordmazedonien", uicCountryCode: 65 },
  { countryCode: "MT", description: "Malta", uicCountryCode: 214 },
  { countryCode: "MD", description: "Moldawien", uicCountryCode: 139 },
  { countryCode: "MC", description: "Monaco", uicCountryCode: 87 },
  { countryCode: "ME", description: "Montenegro", uicCountryCode: 62 },
  { countryCode: "NL", description: "Niederlande", uicCountryCode: 84 },
  { countryCode: "NO", description: "Norwegen", uicCountryCode: 76 },
  { countryCode: "PL", description: "Polen", uicCountryCode: 51 },
  { countryCode: "PT", description: "Portugal", uicCountryCode: 94 },
  { countryCode: "RO", description: "Rumänien", uicCountryCode: 53 },
  { countryCode: "RU", description: "Russland", uicCountryCode: 20 },
  { countryCode: "RS", description: "Serbien", uicCountryCode: 72 },
  { countryCode: "SK", description: "Slowakei", uicCountryCode: 56 },
  { countryCode: "SI", description: "Slowenien", uicCountryCode: 79 },
  { countryCode: "ES", description: "Spanien", uicCountryCode: 71 },
  { countryCode: "SE", description: "Schweden", uicCountryCode: 74 },
  { countryCode: "CH", description: "Schweiz", uicCountryCode: 85 },
  { countryCode: "TR", description: "Türkei", uicCountryCode: 75 },
  { countryCode: "UA", description: "Ukraine", uicCountryCode: 22 },
  { countryCode: "GB", description: "Vereinigtes Königreich", uicCountryCode: 70 },
  { countryCode: "VA", description: "Vatikanstadt", uicCountryCode: 830 }
];


export class OrdersMock {
    static list(): ApiOrdersListResponse {
        const response: ApiOrdersListResponse = {
            items: this.ordersList(),
            limit: 10,
            offset: 0,
            total: 3
        };
        return response;
    }

    static ordersList(): OrderItem[] {
        const list: OrderItem[] = [];
        for (let el of ['ABC', 'DEF', 'GHI']) {
            list.push(OrdersMock.order(el));
        }

        return list;
    }

    static ordersRequestConditions(): ApiOrdersListRequest {
        return {
            orderNumber: '',
            orderStatus: [],
            customerReference: '',
            shipmentDateFrom: null,
            shipmentDateTo: null,
            sendingStationObjectKeyAlpha: null,
            sendingStationObjectKeySequence: null,
            receivingStationObjectKeyAlpha: null,
            receivingStationObjectKeySequence: null,
            customerProfiles: null,
            offset: 0,
            limit: 25,
            sort: '+shipmentDate',
        };
    }

    static order(text: string): OrderItem {
        return {

            orderNumber: text + 'OrderNumber',
            customerReference: text + 'customerReference',
            length: 1,
            nhmCodes: ['123', '321', '115', '687'],
            orderStatus: 'STATUS',
            receivingStation: {
                name: 'Receiving station name',
                objectKeyAlpha: 'OBJ_K_A',
                objectKeySequence: 123
            },
            sendingStation: {
                name: 'Sending station name',
                objectKeyAlpha: 'OBJ_K_A_Sending',
                objectKeySequence: 321
            },
            shipmentDate: new Date(),
            weight: 654,
            netWeight: 10,
            numberOfWagons: 1,
            authorization: [],
            carrierRoute: [
                {
                    carrier: {
                        name: 'Carrier name',
                        uicCompanyCode: 'Carrier code',
                    },
                    plannedArrival: 'Date-String',
                    plannedDeparture: 'Date-String',
                    productionDate: new Date(),
                    receivingStation: {
                        name: 'Receiving station name',
                        objectKeyAlpha: 'OBJ_K_A',
                        objectKeySequence: 123
                    },
                    sendingStation: {
                        name: 'Sending station name',
                        objectKeyAlpha: 'OBJ_K_A_Sending',
                        objectKeySequence: 321
                    },
                    trainNumber: 'train-number-string',
                }
            ]
        }
    }

    // static orderDetails(): OrderDetails {
    //     return {
    //         orderer: 'Besteller Name',
    //         cancelationReason: 'cancelation reason...',
    //         customerReference: 'Cust Ref',
    //         customerLanguage: 'de',
    //         dangerousGood: {
    //             unCode: '123',
    //             unDescription: 'Nikotin'
    //         },
    //         earliestDelivery: '2022-08-20T09:37:42Z',
    //         earliestHandover: '2022-08-20T09:37:43Z',
    //         latestDelivery: '2022-08-20T09:37:44Z',
    //         latestHandover: '2022-08-20T09:37:45Z',
    //         miscInformation: 'Sonstige Informationen',
    //         nhmCode: '654',
    //         orderReason: 'Bestellgrunds',
    //         orderStatus: OrderStatusTypes.Accepted,
    //         partnerId: 'P654',
    //         numberOfWagons: 2,
    //         plannedLength: 15,
    //         plannedNetWeight: 60,
    //         plannedWeight: 120.000,
    //         receiver: 'Empfänger',
    //         receivingStation: {
    //             name: 'Receiving station name',
    //             objectKeyAlpha: 'OBJ_K_A_Receiving',
    //             objectKeySequence: 321
    //         },
    //         receivingWorkDirection: 's/n',
    //         reductionNote: 'Zu lang',
    //         sender: 'Versender',
    //         sendingStation: {
    //             name: 'Sending station name',
    //             objectKeyAlpha: 'OBJ_K_A_Sending',
    //             objectKeySequence: 321
    //         },
    //         sendingWorkDirection: 'n/s',
    //         sgvNumber: '987654321',
    //         shipmentDate: '2022-08-20'
    //     }
    // }
    //
    // static orderDetailsResponse(): ApiOrderDetailResponse {
    //     return {order: this.orderDetails(), errors: []}
    // }
}
