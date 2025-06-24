import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleDetailsComponent } from './vehicle-details.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Vehicle } from './models/vehicle-details.model';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VehicleDetailsService } from './service/vehicle-details.service';
import { of } from 'rxjs';
/*
describe('VehicleDetailsComponent', () => {
  let component: VehicleDetailsComponent;
  let fixture: ComponentFixture<VehicleDetailsComponent>;

  beforeEach(async () => {
  const vehicleDetailsMock : Vehicle = {
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
    "loadLimitPattern": [{ "x": [{ "y": [{ "lineCategory": "A", "loadLimit": 36.5 }, { "lineCategory": "B1", "loadLimit": 36.5 }, { "lineCategory": "B2", "loadLimit": 48.5 }, { "lineCategory": "C2", "loadLimit": 53.5 }, { "lineCategory": "C3", "loadLimit": 58.5 }, { "lineCategory": "C4", "loadLimit": 58.5 }, { "lineCategory": "D2", "loadLimit": 53.5 }, { "lineCategory": "D3", "loadLimit": 63 }, { "lineCategory": "D4", "loadLimit": 66 }], "speedLimit": "S", "asterisks": "**" }, { "y": [{ "lineCategory": "A", "loadLimit": 0 }, { "lineCategory": "B1", "loadLimit": 0 }, { "lineCategory": "B2", "loadLimit": 0 }, { "lineCategory": "C2", "loadLimit": 0 }, { "lineCategory": "C3", "loadLimit": 0 }, { "lineCategory": "C4", "loadLimit": 0 }, { "lineCategory": "D2", "loadLimit": 0 }, { "lineCategory": "D3", "loadLimit": 0 }, { "lineCategory": "D4", "loadLimit": 0 }], "speedLimit": "120" }], "countryCode": [] }, { "x": [{ "y": [{ "lineCategory": "CM2", "loadLimit": 53.5 }, { "lineCategory": "CM3", "loadLimit": 60.5 }, { "lineCategory": "CM4", "loadLimit": 60.5 }], "speedLimit": "100" }], "countryCode": ["80"] },{ "x": [{ "y": [{ "lineCategory": "OM2", "loadLimit": 14.5 }, { "lineCategory": "AM3", "loadLimit": 40.5 }, { "lineCategory": "BM4", "loadLimit": 160.5 }], "speedLimit": "300" }], "countryCode": ["55"] }],

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
  const httpStub = {
    get: () => of(vehicleDetailsMock)
    };
    
  
    await TestBed.configureTestingModule({
      imports: [        
        MAT_DIALOG_DATA,
        TranslateService,
        MatDialogModule,
        MatDialogRef,
        ViewEncapsulation,
        Component,
        Inject
      ],
      declarations: [VehicleDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VehicleDetailsComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ VehicleDetailsComponent, SuitableForRunningPipe ],
      providers: [ SuitableForRunningPipe,
        { provide: MAT_DIALOG_DATA, useValue: vehicleDetailsMock },
        { provide: MatDialogRef, useValue: vehicleDetailsMock },

        { provide: VehicleDetailsService, useValue: vehicleDetailsMock }
      ]
    })
      
    expect(component).toBeTruthy();
  });
});
*/
