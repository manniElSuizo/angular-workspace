import { Vehicle, } from "../models/vehicle-details.model";
export class ApiVehicleDetailsMocks {

  private enumToStringArray<T>(enumObj: T): string[] {
    return Object.values(enumObj);
  }
  private stringToEnum<T>(enumObj: T, value: string): T[keyof T] | undefined {
    return (Object.values(enumObj) as string[]).includes(value) ? value as T[keyof T] : undefined;
  }

  public getStaticVehicleDataResponse(): Vehicle {
    return this.vh2;
  }

  private vh2: Vehicle = {
    "operationCode": "SCHAD",
    "vehicleNumber": "218024588145",
    "approvalStateCode": "90",
    "processingTime": "2024-07-11T09:19:59.000Z",
    "technicalAttributes": {
      "internationalFreightWagonClass": "Hbbillns",
      "nationalFreightWagonClass": "",
      "seriesGroupNr": "9",
      "typeOfConstruction": "305",
      "description": "Hbbill(n)s",
      "intermodalRelevant": false,
      "tareWeight": 16300,
      "homeStationBvw": "80",
      "homeStationBst": "234716",
      "homeStationRL100": "",
      "couplingUIC": "2",
      "bogieWheelBase": 0,
      "wheelBase": 9000,
      "numberOfBogies": "0",
      "numberOfAxles": "2",
      "internalAxleSpacing": 9000,
      "heatingFlag": false,
      "heatingType": "99",
      "maximumSpeedLoaded": 120,
      "maximumSpeedEmpty": 120,
      "maxSpeedG": false,
      "loadingLength": 14236,
      "loadingArea": 41.3,
      "loadingVolume": 105.0,
      "lengthOverBuffers": 15500,
      "typeOfParkingBrake": "9",
      "energySupplyType": "0",
      "typeOfLimitation": "50",
      "assetAcc": "841",
      "basicDispositionType": "183",
      "subtypeOfConstruction": []
    },
    "currentState": {
      "vehicleKeeperCode": "80000",
      "vehicleKeeperMarking": "DB",
      "vehicleType": "061",
      "costCentre": "67000084023",
      "operabilityOfBrakes": "1",
      "handbrakeWorking": 1,
      "suitableForRunning": "6",
      "dispoCriteria": "0",
      "stateOfBrake": "1"
    },
    "damage": {
      "maintenanceGrade": ["G42", "G48", "G42", "G48"],
      "peakFlag": false,
      "interopBorderLine": "0",
      "damageMaxSpeed": 100,
      "wagonInspecLastDateTime": "2024-07-09T17:34:00",
      "wagonInspecLastBvw": "",
      "wagonInspecLastBst": "935189",
      "wagonInspecLastRL100": "",
      "lastDamageTreatment": "",
      "lastDamageTreatmentDay": "",
      "workshopType": "1",
      "damageAccount": 9,
      "workshopBvw": "",
      "workshopBst": "",
      "damageType": [
        {
          "damageTypeCode": "005",
          "damageCauseCode": "0"
        },
        {
          "damageTypeCode": "055",
          "damageCauseCode": "0"
        },
        {
          "damageTypeCode": "003",
          "damageCauseCode": "0"
        }
      ]
    },
    "loadLimitPattern": [{ "x": 
                      [{ "y": 
                          [{ "lineCategory": "A", "loadLimit": 36.5 }, 
                           { "lineCategory": "B1", "loadLimit": 36.5 }, 
                           { "lineCategory": "B2", "loadLimit": 48.5 }, 
                           { "lineCategory": "C2", "loadLimit": 53.5 }, 
                           { "lineCategory": "C3", "loadLimit": 58.5 }, 
                           { "lineCategory": "C4", "loadLimit": 58.5 }, 
                           { "lineCategory": "D2", "loadLimit": 53.5 }, 
                           { "lineCategory": "D3", "loadLimit": 63 }, 
                           { "lineCategory": "D4", "loadLimit": 66 }],
                            "speedLimit": "S", "asterisks": "**" }, 
                         { "y": 
                          [{ "lineCategory": "A", "loadLimit": 11 }, 
                           { "lineCategory": "B1", "loadLimit": 22 }, 
                           { "lineCategory": "B2", "loadLimit": 33 }, 
                           { "lineCategory": "C2", "loadLimit": 44 }, 
                           { "lineCategory": "C3", "loadLimit": 55 }, 
                           { "lineCategory": "C4", "loadLimit": 66 }, 
                           { "lineCategory": "D2", "loadLimit": 77 }, 
                           { "lineCategory": "D3", "loadLimit": 88 }, 
                           { "lineCategory": "D4", "loadLimit": 99 }], 
                           "speedLimit": "120" },
                           { "y": 
                            [{ "lineCategory": "A", "loadLimit": 10 }, 
                             { "lineCategory": "B1", "loadLimit": 15 }, 
                             { "lineCategory": "B2", "loadLimit": 20 }, 
                             { "lineCategory": "C2", "loadLimit": 25 }, 
                             { "lineCategory": "C3", "loadLimit": 30}, 
                             { "lineCategory": "C4", "loadLimit": 35 }, 
                             { "lineCategory": "D2", "loadLimit": 40 }, 
                             { "lineCategory": "D3", "loadLimit": 45 }, 
                             { "lineCategory": "D4", "loadLimit": 50 }], 
                             "speedLimit": "150" },
                             { "y": 
                              [{ "lineCategory": "A", "loadLimit": 100 }, 
                               { "lineCategory": "B1", "loadLimit": 150 }, 
                               { "lineCategory": "B2", "loadLimit": 200 }, 
                               { "lineCategory": "C2", "loadLimit": 250 }, 
                               { "lineCategory": "C3", "loadLimit": 300}, 
                               { "lineCategory": "C4", "loadLimit": 350 }, 
                               { "lineCategory": "D2", "loadLimit": 400 }, 
                               { "lineCategory": "D3", "loadLimit": 450 }, 
                               { "lineCategory": "D4", "loadLimit": 500 }], 
                               "speedLimit": "1150" }],
                            "countryCode": [] },
                            { "x": [
                                { "y": 
                                  [{ "lineCategory": "CM2", "loadLimit": 53.5 },
                                  { "lineCategory": "CM3", "loadLimit": 60.5 },
                                  { "lineCategory": "CM4", "loadLimit": 60.5 }], 
                                "speedLimit": "100" }]
                                , "countryCode": ["80"] },{ "x": [{ "y": [{ "lineCategory": "OM2", "loadLimit": 14.5 }, { "lineCategory": "AM3", "loadLimit": 40.5 }, { "lineCategory": "BM4", "loadLimit": 160.5 }], "speedLimit": "300" }], "countryCode": ["55"] }],

    "cluster": {
      "clusterCode": "0V0.000",
      "clusterFleet2": ""
    },
    "revision": {
      "revisionPeriod": 72,
      "periodDuration": 72,
      "dateNextRevision": "2029-04-06",
      "dateLastRevision": "2023-04-06",
      "datePeriod": "2023-04-06"
    },
    "wagonBrakes": {
      "brakeChangeOverWeight": 25,
      "brakedMassGLoaded": 29,
      "brakedMassGEmpty": 18,
      "brakedMassPLoaded": 29,
      "brakedMassPEmpty": 18,
      "brakeType": "3",
      "currentBrakedMass": 18,
      "brakeKind": "2"
    },
    "masterDataCodeTypes": [
      {
        "type": "AVVSCHAD",
        "description": "Schadcodes nach AVV",
        "codes": [
          {
            "code": "0.0.3",
            "descriptions": [
              {
                "languageCode": "de",
                "shortDescription": "003",
                "longDescription": "Zuführung auf besondere Weisung notwendig"
              },
              {
                "languageCode": "st",
                "shortDescription": "003",
                "longDescription": "0.0.3"
              }
            ]
          },
          {
            "code": "0.0.5",
            "descriptions": [
              {
                "languageCode": "de",
                "shortDescription": "005",
                "longDescription": "DV-gesteuerte große REV-Zuführung"
              },
              {
                "languageCode": "st",
                "shortDescription": "005",
                "longDescription": "0.0.5"
              }
            ]
          },
          {
            "code": "0.5.5",
            "descriptions": [
              {
                "languageCode": "de",
                "shortDescription": "055",
                "longDescription": "große Revision (mit DV-System ISI gesteuerte Wg)"
              },
              {
                "languageCode": "st",
                "shortDescription": "055",
                "longDescription": "0.5.5"
              }
            ]
          }
        ]
      }
    ]
  }

  private staticVehicle = {
    "operationCode": "SCHAD",
    "vehicleNumber": "218024588145",
    "approvalStateCode": "90",
    "processingTime": "2024-07-11T09:19:59.000Z",
    "technicalAttributes": {
      "internationalFreightWagonClass": "Hbbillns",
      "nationalFreightWagonClass": "",
      "seriesGroupNr": "9",
      "typeOfConstruction": "305",
      "description": "Hbbill(n)s",
      "intermodalRelevant": false,
      "tareWeight": 16300,
      "homeStationBvw": "80",
      "homeStationBst": "234716",
      "homeStationRL100": "",
      "couplingUIC": "2",
      "bogieWheelBase": 0,
      "wheelBase": 9000,
      "numberOfBogies": "0",
      "numberOfAxles": "2",
      "internalAxleSpacing": 9000,
      "heatingFlag": false,
      "heatingType": "99",
      "maximumSpeedLoaded": 120,
      "maximumSpeedEmpty": 120,
      "maxSpeedG": false,
      "loadingLength": 14236,
      "loadingArea": 41.3,
      "loadingVolume": 105.0,
      "lengthOverBuffers": 15500,
      "typeOfParkingBrake": "9",
      "energySupplyType": "0",
      "typeOfLimitation": "50",
      "assetAcc": "841",
      "basicDispositionType": "183",
      "subtypeOfConstruction": []
    },
    "currentState": {
      "vehicleKeeperCode": "80000",
      "vehicleKeeperMarking": "DB",
      "vehicleType": "061",
      "costCentre": "67000084023",
      "operabilityOfBrakes": "1",
      "handbrakeWorking": 1,
      "suitableForRunning": "6",
      "dispoCriteria": "0",
      "stateOfBrake": "1"
    },
    "damage": {
      "maintenanceGrade": ["G42", "G48", "G42", "G48"],
      "peakFlag": false,
      "interopBorderLine": "0",
      "damageMaxSpeed": 100,
      "wagonInspecLastDateTime": "2024-07-09T17:34:00",
      "wagonInspecLastBvw": "",
      "wagonInspecLastBst": "935189",
      "WagonInspecLastRL100": "",
      "lastDamageTreatment": "",
      "lastDamageTreatmentDay": "",
      "workshopType": "1",
      "damageAccount": 9,
      "workshopBvw": "",
      "workshopBst": "",
      "damageType": [
        {
          "damageTypeCode": "005",
          "damageCauseCode": "0"
        },
        {
          "damageTypeCode": "055",
          "damageCauseCode": "0"
        },
        {
          "damageTypeCode": "003",
          "damageCauseCode": "0"
        }
      ]
    },
    "loadLimitPattern": {
      "x": [{
        "speedLimit": "S",
        "y": [{
          "lineCategory": "A",
          "loadLimit": 15.5
        },
        {
          "lineCategory": "B",
          "loadLimit": 19.5
        }
          , {
          "lineCategory": "C",
          "loadLimit": 24.5
        },
        {
          "lineCategory": "D",
          "loadLimit": 28.5
        }
        ],
        "asterisks": "**"
      },
      {
        "speedLimit": "120",
        "y": [{
          "lineCategory": "A",
          "loadLimit": 0
        },
        {
          "lineCategory": "B",
          "loadLimit": 0
        },
        {
          "lineCategory": "C",
          "loadLimit": 0
        },
        {
          "lineCategory": "D",
          "loadLimit": 0
        }
        ]
      },
      {
        "speedLimit": "100",
        "y": [{
          "lineCategory": "CM",
          "loadLimit": 25.5
        }]
      }]
      ,
      "countryCode": ["80"]
    },
    "wagonBrakes": {
      "brakeChangeOverWeight": "25",
      "brakedMassGLoaded": 29,
      "brakedMassGEmpty": 18,
      "brakedMassPLoaded": 29,
      "brakedMassPEmpty": 18,
      "brakeType": 3,
      "currentBrakedMass": 18,
      "brakeKind": 2
    },


    "cluster": {
      "clusterCode": "0V0.000",
      "clusterFleet": ""
    },
    "revision": {
      "revisionPeriod": 72,
      "periodDuration": 72,
      "dateNextRevision": "2029-04-06",
      "dateLastRevision": "2023-04-06",
      "datePeriod": "2023-04-06"
    },
    "masterDataCodeTypes": [
      {
        "type": "AVVSCHAD",
        "description": "Schadcodes nach AVV",
        "codes": [
          {
            "code": "0.0.3",
            "descriptions": [
              {
                "languageCode": "de",
                "shortDescription": "003",
                "longDescription": "Zuführung auf besondere Weisung notwendig"
              },
              {
                "languageCode": "st",
                "shortDescription": "003",
                "longDescription": "0.0.3"
              }
            ]
          },
          {
            "sode": "0.0.5",
            "descriptions": [
              {
                "languageCode": "de",
                "shortDescription": "005",
                "longDescription": "DV-gesteuerte große REV-Zuführung"
              },
              {
                "languageCode": "st",
                "shortDescription": "005",
                "longDescription": "0.0.5"
              }
            ]
          },
          {
            "code": "0.5.5",
            "descriptions": [
              {
                "languageCode": "de",
                "shortDescription": "055",
                "longDescription": "große Revision (mit DV-System ISI gesteuerte Wg)"
              },
              {
                "languageCode": "st",
                "shortDescription": "055",
                "longDescription": "0.5.5"
              }
            ]
          }
        ]
      }
    ]

  }
}