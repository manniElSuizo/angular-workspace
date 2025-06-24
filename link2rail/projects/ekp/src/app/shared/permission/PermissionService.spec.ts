import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Authorization, CustomerData } from '@src/app/trainorder/models/authorization';
import { PermissionService } from './PermissionService';
import { EnvService } from '../services/env/env.service';
import { ModalWindows } from '../components/modal-windows/modal-windows';
import { LocalStorageService } from '../services/local-storage/local-storage.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [EnvService, ModalWindows, LocalStorageService]
    });
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true or false depending on permissions', () => {
    const storageService = new LocalStorageService();
    const immediatAuth: any[] = [];
    storageService.setImmediateAuthorizations(immediatAuth);
    const customerProfiles: CustomerData[] = [
      {
        sgvId: "987787140",
        partnerId: "24875714",
        authorization: [
          Authorization.READ_ORDER,
          Authorization.READ_TRAIN,
          Authorization.READ_TRAIN_DETAILS,
          Authorization.READ_TRAIN_POSITION,
          Authorization.READ_TRACKING
        ],
        customerName: "Nestle Waters Deutschland GmbH",
        siteName: "Stammsitz"
      },
      {
        sgvId: "1682533",
        partnerId: "18462545",
        authorization: [
          Authorization.READ_ORDER_TEMPLATE,
          Authorization.READ_ORDER,
          Authorization.CREATE_ORDER_FLEXTRAIN,
          Authorization.UPLOAD_PROGRAM,
          Authorization.REDUCTION,
          Authorization.CANCEL_SPECIAL_TRAIN,
          Authorization.CANCEL_SPECIAL_TRAIN,
          Authorization.READ_TRAIN,
          Authorization.READ_TRAIN_DETAILS,
          Authorization.READ_TRAIN_POSITION,
          Authorization.CANCEL_TRAIN
        ], customerName: "DB Bahnbau Gruppe GmbH", siteName: "Produktion OBL Fahrbahn Nord"
      }, {
        sgvId: "4010",
        partnerId: "1000848",
        authorization: [Authorization.READ_ORDER_TEMPLATE, Authorization.READ_ORDER, Authorization.CREATE_ORDER_FLEXTRAIN, Authorization.UPLOAD_PROGRAM, Authorization.CANCEL_SPECIAL_TRAIN, Authorization.CANCEL_SPECIAL_TRAIN, Authorization.READ_TRAIN, Authorization.READ_TRAIN_DETAILS, Authorization.READ_TRAIN_POSITION, Authorization.CANCEL_TRAIN], customerName: "ThyssenKrupp Steel Europe AG", siteName: "ThyssenKrupp Steel Europe AG"
      }];
    storageService.setCustomerProfiles(customerProfiles);
    service.setActiveProfiles(JSON.parse('[{"sgvId":"4010","partnerId":"1000848","authorization":["READ_ORDER_TEMPLATE","READ_ORDER","CREATE_ORDER_FLEXTRAIN","UPLOAD_PROGRAM","CANCEL_SPECIAL_TRAIN","CANCEL_SPECIAL_TRAIN","READ_TRAIN","READ_TRAIN_DETAILS","READ_TRAIN_POSITION","CANCEL_TRAIN"],"customerName":"ThyssenKrupp Steel Europe AG","siteName":"ThyssenKrupp Steel Europe AG"}]'));

    service.hasPermission(null, [Authorization.REDUCTION, Authorization.CANCEL_SPECIAL_TRAIN]).subscribe((has) => expect(has).toBeTrue());
    service.hasPermission(null, [Authorization.CANCEL_SPECIAL_TRAIN]).subscribe((has) => expect(has).toBeTrue());
    service.hasPermission(null, [Authorization.REDUCTION]).subscribe((has) => expect(has).toBeFalse());
    localStorage.clear();
  });
});
