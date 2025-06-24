import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../../../shared.module';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { OrderKey } from '@src/app/order-management/components/wagon-view/models/api-wagon-list';
import { ExternalReference, Goods, LoadingTackles, RailOrder, WagonInformation } from '@src/app/order-management/models/rail-order-api';
import { VehicleDetailsService } from '../../vehicle-details/service/vehicle-details.service';
import { Vehicle, VehicleByVehicleNumberRequest } from '../../vehicle-details/models/vehicle-details.model';
import { Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CodeNamePair } from '@src/app/order-management/models/general-order';
import { RailOrderInternalService } from '@src/app/order-management/service/rail-order-internal.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    TranslateModule
  ]
})
export class OrderDetailsComponent implements OnInit {
  protected railOrder: RailOrder;
  protected orderKey: OrderKey;
  protected wagonNumber: string;
  protected browserCultureLang: string;
  protected currentWagon: WagonInformation | undefined;
  protected currentVehicleInformation: Vehicle | null;
  protected exceptionalConsignmentsPermissionNumber: string = '';
  protected senderReferences: ExternalReference[]  | undefined = undefined;
  protected receiverReferences: ExternalReference[] | undefined = undefined;
  protected customerAgreement: string = '';
  protected goodsList: Goods[] = [];
  protected loadingTacklesList: LoadingTackles[] = [];
  protected loadingTackles: CodeNamePair[] = [];
  protected loadingTacklesWeight: number = 0;
  protected totalWeight: number = 0;

  // Subject to emit the vehicle data once loaded
  private vehicleDataLoaded$: Subject<Vehicle | undefined> = new Subject<Vehicle | undefined>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private param: { orderKey: OrderKey, wagonNumber: string, railOrder: RailOrder },
    translate: TranslateService,
    private vehicleDetailsService: VehicleDetailsService,
    private railOrderInternalService: RailOrderInternalService
  ) {
    this.orderKey = param.orderKey;
    this.wagonNumber = param.wagonNumber;
    this.railOrder = param.railOrder;
    this.browserCultureLang = translate.getBrowserCultureLang();

  }

  ngOnInit(): void {
    // Load vehicle information first
    this.loadVehicleInformation();
    // Create loading tackles CodeNamePair
    this.createLoadingTackes()

    // Subscribe to the subject to initialize wagon and other details after vehicle data is loaded
    this.vehicleDataLoaded$.subscribe(vehicleData => {
      if (vehicleData) {
        this.currentVehicleInformation = vehicleData;
      } else {
        console.warn('Vehicle data not found or is undefined');
      }
      // Proceed to initialize wagon information and other details
      this.initializeWagonInformation();
    });

  }

  // Load vehicle data and emit via Subject once loaded
  private loadVehicleInformation(): void {
    const vehicleByVehicleNumberRequest: VehicleByVehicleNumberRequest = {
      VehicleNumber: this.wagonNumber
    };

    this.vehicleDetailsService.getVehicleDataByVehicleNumber(vehicleByVehicleNumberRequest)
      .pipe(
        catchError(error => {
          console.error('Error fetching vehicle information:', error);
          return of(undefined); // Emit undefined in case of error
        })
      )
      .subscribe(vehicleData => {
        this.vehicleDataLoaded$.next(vehicleData);
      });
  }

  // Initialize the wagon information based on the loaded vehicle data
  private initializeWagonInformation(): void {
    this.currentWagon = this.findWagonByNumber(this.wagonNumber);
    if (this.currentWagon) {
      // If the wagon was found, initialize the goods list and other details
      this.goodsList = this.currentWagon?.goods ?? [];
      this.loadingTacklesList = this.currentWagon?.loadingTackles ?? [];
      this.loadingTacklesWeight = this.currentWagon?.loadingTacklesWeight ?? 0;
      console.log('Wagon information initialized:', this.currentWagon);
    } else {
      console.warn('Wagon information not found for wagon number:', this.wagonNumber);
    }

    // Initialize other details
    this.exceptionalConsignmentsPermissionNumber = this.getExceptionalConsignmentsPermissionNumber();
    this.customerAgreement = this.getCustomerAgreement();
    this.getReferenceLists();
    this.totalWeight = this.calculateTotalWeight()
  }

  // Helper function to find a wagon by its number
  private findWagonByNumber(wagonNumber: string): WagonInformation | undefined {
    return this.railOrder?.wagonInformation?.find(wagon => wagon.wagonNumber === wagonNumber);
  }

  private getExceptionalConsignmentsPermissionNumber(): string {
    const imCode = "2180";
    const permissionNumberRegex = /^[A-Za-z]\d{7}$/;

    const matchingConsignment = this.currentWagon?.exceptionalConsignments?.find(consignment => {
      return consignment.imCode === imCode && permissionNumberRegex.test(consignment.permissionNumber);
    });

    return matchingConsignment?.permissionNumber || '';
  }

  private getReferenceLists() {
    this.senderReferences = this.railOrder?.externalReferences?.filter(ref => ref.type === 'RAR') || [];
    this.receiverReferences = this.currentWagon?.externalReferences?.filter(ref => ref.type === 'CRR') || [];
  }


  private getCustomerAgreement(): string {
    const contractNumber = this.railOrder?.contractNumber;
    const discountCode = this.railOrder?.commercialTransportConditions?.discountCode;

    let customerAgreement = contractNumber ?? ''; // Initialize with contract number if present

    if (discountCode) {
      customerAgreement = customerAgreement ? `${customerAgreement} / ${discountCode}` : discountCode;
    }

    return customerAgreement;
  }

  private calculateTotalWeight(): number {
    // Get the tare weight from vehicle's technical attributes (default to 0 if not available)
    const tareWeight = this.currentVehicleInformation?.technicalAttributes?.tareWeight ?? 0;

    // Sum all the weights from the goods in the wagon (default to 0 if undefined)
    const totalGoodsWeight = this.currentWagon?.goods?.reduce((total, good) => {
      return total + (good.weight ?? 0);
    }, 0) ?? 0;

    // Return the sum of tare weight and total goods weight
    return tareWeight + totalGoodsWeight + this.loadingTacklesWeight;
  }

  protected getLoadingTackles(type:string):string{
    return this.loadingTackles.find((loadingTackle: CodeNamePair) => loadingTackle.code === type)?.name || type;
  }

  private createLoadingTackes(): void {
    this.railOrderInternalService.getLoadingTackles().subscribe((result: CodeNamePair[]) => {
      this.loadingTackles = result;
    });
  }

}
