
import { RailorderSummary, WagonSummary } from "@src/app/trainorder/models/ApiRailOrder.model";
import { Tools } from "./tools";
    //const mockOrderNumbers:number[] = [80202311203986698, 80202311203986781, 80202311203986833, 80202311203986869, 80202311203986879];
    const mockWagonNumber1: string = '31 80 3948 363-7'//,'37 80 5358 938-8','31 80 0834 439-8','33 80 4672 373-4','31 80 3948 363-7'];
    const mockWagonNumber2: string = '37 80 5358 938-8'//,'31 80 0834 439-8','33 80 4672 373-4'];
    const mockOrderNumber1: string = '80 20231120 398 6698';
    const  mockOrderNumber2: string = '80 20231120 398 6781';


    export const mockWagonSummary1: WagonSummary = {
        wagonNumber: Tools.getRandomWagonNumber(),
        wagonType: Tools.getRandomVehicleType(),
        shippingTimestamp: Tools.randomDate(new Date(2024, 5, 18), new Date(2025, 7, 30), 0, 24),
        orderNumber: Tools.getRandomOrderNumber(),
        consignor: Tools.getRandomFirmName(),
        consignee: Tools.getRandomFirmName(),
        nhmCode: Tools.getRandomNHMCode(),
        receivingStation: Tools.getRanomStationName(),
        sendingStation:Tools.getRanomStationName(),
        numberOfAxis: 4,
        cargoWeight: 15,
        vehicleWeight: 33,
        totalWeight: 48,
        length: 24280
    }

    export const mockWagonSummary2: WagonSummary = {
        wagonNumber: '318039483637',
        wagonType: 'Habiis',
        shippingTimestamp: new Date('2024-06-02'),
        orderNumber: 80202311203986698,
        consignor: 'VW Emden',
        consignee: 'Volkswagen',
        nhmCode: '230910',
        receivingStation: Tools.getRanomStationName(),
        sendingStation:Tools.getRanomStationName(),
        numberOfAxis: 4,
        cargoWeight: 15,
        vehicleWeight: 33,
        totalWeight: 48,
        length: 24280
    }

    export const mockWagonSummary3: WagonSummary = {
        wagonNumber: '478424640060',
        wagonType: 'Habiins',
        shippingTimestamp: new Date('2024-06-02'),
        orderNumber: 80202405063941757,
        consignor: 'Bayer Leverkusen',
        consignee: 'Faserwerke Lingen',
        nhmCode: '230910',
        receivingStation: Tools.getRanomStationName(),
        sendingStation:Tools.getRanomStationName(),
        numberOfAxis: 8,
        cargoWeight: 15,
        vehicleWeight: 33,
        totalWeight: 48,
        length: 158000
    }
    export const mockWagonSummary4: WagonSummary = {
        wagonNumber: '428022640754',
        wagonType: 'Dienstwagen',
        shippingTimestamp: new Date('2024-06-02'),
        orderNumber: 80202405063942726,
        consignor: 'Bayer Paris',
        consignee: 'Chemiewerke',
        nhmCode: '230910',
        receivingStation: Tools.getRanomStationName(),
        sendingStation:Tools.getRanomStationName(),
        numberOfAxis: 4,
        cargoWeight: 15,
        vehicleWeight: 33,
        totalWeight: 48,
        length: 24280
    }

    export const MockWagonSummaryList1: WagonSummary[] =Tools.getRandomWagonSummaryList()
    export const MockWagonSummaryList2: WagonSummary[] = Tools.getRandomWagonSummaryList()
    export const MockWagonSummaryList3: WagonSummary[] = Tools.getRandomWagonSummaryList()

    export const mockRailorderSummary1: RailorderSummary = {
        trainNumber: '60608',
        prodDate: new Date('2024-06-05'),
        wagons: MockWagonSummaryList1,
    };

    export const mockRailorderSummary2: RailorderSummary = {
        trainNumber: '60609',
        prodDate: new Date('2024-06-06'),
        wagons: MockWagonSummaryList2,

    };

    export const mockRailorderSummary3: RailorderSummary = {
        trainNumber: '60610',
        prodDate: new Date('2024-06-06'),
        wagons: MockWagonSummaryList3,
    };

    export const mockRailorderSummaryList: RailorderSummary[] = [
        mockRailorderSummary1, mockRailorderSummary2, mockRailorderSummary3
    ]
