import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormDialogModule } from "../../../../../shared/components/form-dialog/form-dialog.module";
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { initialGoodMinimal, initialWagonInformationMinimal, RailOrder, WagonInformation } from '@src/app/order-management/models/rail-order-api';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ApiGoodResponse, GoodModel, WagonCodes, WagonType } from '@src/app/trainorder/models/Cargo.model';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { SharedModule } from '@src/app/shared/shared.module';
import { StringUtils } from '@src/app/shared/utils/string-utils';
import { NewOrderWagonDetailDialogService } from '../../new-order-sections/new-order-wagon-data/service/new-order-wagon-detail-dialog.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ValidationMode } from '../../validators/validator-field.config';
import { NewOrderWagonImportDialogService } from '../../new-order-sections/new-order-wagon-data/service/new-order-wagon-import-dialog.service';
import { NewOrderWagonImportDialogComponent } from '../../new-order-sections/new-order-wagon-data/new-order-wagon-import-dialog/new-order-wagon-import-dialog.component';
import { VehicleDetailsService } from '@src/app/shared/components/vehicle-details/service/vehicle-details.service';
import { Vehicle, VehicleByVehicleNumberRequest } from '@src/app/shared/components/vehicle-details/models/vehicle-details.model';
import { Observable } from 'rxjs';
import { WagonNumberPipe } from '@src/app/shared/pipes/wagon-number.pipe';
import { HttpStatusCode } from '@angular/common/http';
import { ModelService } from '../../service/model.service';
import { OrderTemplateCachingService } from '../../service/order-template-caching.service';

@Component({
  selector: 'app-wagon-information',
  standalone: true,
  imports: [
    CommonModule,
    FormDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule
  ],
  providers: [DecimalPipe],
  templateUrl: './wagon-information.component.html',
  styleUrl: './wagon-information.component.scss'
})
export class WagonInformationComponent implements OnInit, AfterViewInit {
  @Input() fastEntryForm: FormGroup;
  @Input() railOrder: RailOrder;
  @Input() validationMode: ValidationMode;
  @Output() updateRailOrder: EventEmitter<RailOrder> = new EventEmitter<RailOrder>();

  protected loadingStatusOptions = [
    { value: true, label: 'Shared.Loading-state-loaded' },
    { value: false, label: 'Shared.Loading-state-empty' }
  ];

  protected wagonTypeResultLists: WagonType[][] = new Array<WagonType[]>();
  protected nhmCodeAutocomplete: GoodModel[] = [];
  protected totalWeight: number;
  protected wagonCountArray: number[] = Array.from(Array(99).keys());

  private formBuilder: FormBuilder = inject(FormBuilder);
  private trainorderService: TrainorderService = inject(TrainorderService);
  private newOrderWagonDetailService: NewOrderWagonDetailDialogService = inject(NewOrderWagonDetailDialogService);
  private modelService: ModelService = inject(ModelService);
  private wagonNumberPipe: WagonNumberPipe = inject(WagonNumberPipe);
  private orderTemplateCachingService: OrderTemplateCachingService = inject(OrderTemplateCachingService);
  private wagonImportDialogRef: MatDialogRef<NewOrderWagonImportDialogComponent> = null;

  ngOnInit(): void {
    this.fastEntryForm.addControl('wagonInformation', this.formBuilder.array([]));
    this.wagonInformation.valueChanges.subscribe({
      next: (changes) => {
        this.numberOfWagons.setValue(this.wagonInformation.length);
        changes.forEach((c: any, i: number) => {
          const wagonNumber = c.wagonNumber ? String(c.wagonNumber).replace(/\D/g, '') : null;
          this.railOrder.wagonInformation[i].wagonNumber = wagonNumber;
          //this.railOrder.wagonInformation[i].loadingStatus = c.loadingStatus;
          this.railOrder.wagonInformation[i].typeOfWagon = c.typeOfWagon;
          this.railOrder.wagonInformation[i].goods[0].weight = c.weight;
          this.railOrder.wagonInformation[i].goods[0].additionalDescription = c.additionalDescription;
          //this.railOrder.wagonInformation[i].goods[0].nhmCode = c.nhmCode;
          this.railOrder.wagonInformation[i].wagonPosition = i + 1;
        });
        this.calculateWeights();
        this.updateRailOrder.emit(this.railOrder);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initWagonInformation();
    this.calculateWeights();
    this.cd.detectChanges();
  }

  constructor(private cd: ChangeDetectorRef,
              private newOrderWagonImportService: NewOrderWagonImportDialogService,
              private vehicleDetailsService: VehicleDetailsService){
  }

  private initWagonInformation(): void {
    if(!this.railOrder.wagonInformation || !this.railOrder.wagonInformation.length) {
      this.railOrder.wagonInformation = new Array(initialWagonInformationMinimal());
      this.wagonInformation.push(this.getWagonInformationFormGroup(this.railOrder.wagonInformation[0]), {emitEvent: false});
      return;
    }
    this.railOrder.wagonInformation.forEach(wi => this.wagonInformation.push(this.getWagonInformationFormGroup(wi), {emitEvent: false}));
    this.numberOfWagons.setValue(this.wagonInformation.length);
  }

  private addWagonInformation() {
    const wagonInformation = this.orderTemplateCachingService.getOrderTemplate()?.wagonInformation?.[0] || initialWagonInformationMinimal();
    const newWagon = this.cloneWagonInformation(wagonInformation);
    this.railOrder.wagonInformation.push(newWagon);
    this.wagonTypeResultLists.push([]);
    this.wagonInformation.push(this.getWagonInformationFormGroup(newWagon));
    this.calculateWeights();
  }

  private getWagonInformationFormGroup(wagonInformation: WagonInformation = null): FormGroup {
    const fg = this.formBuilder.group({
      checkboxWagon: false,
      wagonNumber: wagonInformation?.wagonNumber,
      typeOfWagon: wagonInformation?.typeOfWagon,
      loadingStatus: wagonInformation?.loadingStatus,
      weight: wagonInformation?.goods[0]?.weight,
      additionalDescription: wagonInformation?.goods[0]?.additionalDescription,
      nhmCode: StringUtils.zeroPadLeft(wagonInformation?.goods[0]?.nhmCode, 6)
    });
    fg.get('nhmCode').disable();
    fg.get('loadingStatus').disable();
    return fg;
  }

  private fillWagonInformationFormGroup(wagonInformation: WagonInformation, idx: number) {
    this.getWagonNumber(idx).setValue(wagonInformation?.wagonNumber, {emitEvent: false});
    this.getTypeOfWagon(idx).setValue(wagonInformation?.typeOfWagon, {emitEvent: false});
    this.getLoadingStatus(idx).setValue(wagonInformation?.loadingStatus, {emitEvent: false});
    this.getWeight(idx).setValue(wagonInformation?.goods[0]?.weight, {emitEvent: false});
    this.getAdditionalDescription(idx).setValue(wagonInformation?.goods[0]?.additionalDescription, {emitEvent: false});
    this.getNhmCode(idx).setValue(wagonInformation?.goods[0]?.nhmCode, {emitEvent: false});
  }

  protected adjustWagonList() {
    const numberOfWagons = this.numberOfWagons.value;
    const wagonInformationList = this.wagonInformation;
    const currentWagonCount = wagonInformationList.length;

    if (numberOfWagons > currentWagonCount) {
      for (let i = currentWagonCount; i < numberOfWagons; i++) {
        this.addWagonInformation();
      }
    } else if (numberOfWagons < currentWagonCount) {
      while (wagonInformationList.length > numberOfWagons) {
        this.removeLine(wagonInformationList.length - 1);
      }
    }
  }

  protected removeLine(idx: number) {
    if (this.wagonInformation.length > 1) {
      this.wagonInformation.removeAt(idx);
      this.railOrder.wagonInformation.splice(idx, 1);
    }
    this.resetWagonTypeResultLists();

    this.calculateWeights();
  }

  protected removeSelectedWagons() {
    const indicesToRemove: number[] = [];
    this.wagonInformation.controls.forEach((control, index) => {
      if (control.get('checkboxWagon')?.value) {
        indicesToRemove.push(index);
      }
    });

    indicesToRemove.sort((a, b) => (b - a)).forEach(i => {
      if (this.wagonInformation.length > 1) {
        this.wagonInformation.removeAt(i);
        this.railOrder.wagonInformation.splice(i, 1);
      }
    });

    this.resetWagonTypeResultLists();
    this.numberOfWagons.setValue(this.wagonInformation.length, {emitEvent: false});
    this.calculateWeights();
  }

  private resetWagonTypeResultLists() {
    this.wagonTypeResultLists = new Array();
    this.wagonInformation.controls.forEach(() => this.wagonTypeResultLists.push([]));
  }

  protected copyWagon(index: number): void {
    const wagonInformation = this.railOrder.wagonInformation[index];
    const newWagon = this.cloneWagonInformation(wagonInformation);
    this.railOrder.wagonInformation.push(newWagon);
    this.wagonTypeResultLists.push([]);
    this.wagonInformation.push(this.getWagonInformationFormGroup(newWagon));
    this.calculateWeights();
   }

  private cloneWagonInformation(wagonInformation: WagonInformation): WagonInformation {
    const newWagon = JSON.parse(JSON.stringify(wagonInformation));
    delete newWagon.transportPlanId;

    delete newWagon.wagonIdentifier;
    delete newWagon.referenceId;
    newWagon.wagonNumber = null;

    if (newWagon?.goods) {
      newWagon.goods.forEach((good: any) => {

        if (good?.referenceId) {
          delete good.referenceId;
        }

        if (good?.dangerousGoods?.[0]) {
          const dg = good.dangerousGoods[0];

          if (dg?.referenceId) {
            delete dg.referenceId;
          }
        }
      });
    }
    return newWagon;
  }

  protected openEditWindow(idx: number) {
    this.newOrderWagonDetailService.openWagonDetailDialog(this.railOrder, idx, true, this.validationMode, true).afterClosed().subscribe({
      next: (wagonInformation: WagonInformation) => {
        if (wagonInformation) {
          this.railOrder.wagonInformation[idx] = wagonInformation;
          this.fillWagonInformationFormGroup(wagonInformation, idx);
          this.calculateWeights();
        }

        this.modelService.preventEmptyPackingUnit(this.railOrder.wagonInformation);
      }
    });
  }

  private calculateWeights(): void {
    this.totalWeight = 0;
    this.railOrder.wagonInformation.forEach(wagon => {
      wagon.loadingTacklesWeight = 0;
      wagon.goodWeight = 0;
      if (wagon?.loadingTackles) {
        wagon.loadingTackles.forEach(loadingTackles => {
          const currentloadingTackleWeight = Number(loadingTackles.weight) || 0;
          this.totalWeight += currentloadingTackleWeight;
          wagon.loadingTacklesWeight += currentloadingTackleWeight;
        });
      }

      if (wagon?.goods) {
        wagon.goods.forEach(good => {
          const currentGoodWeight = Number(good.weight) || 0;
          this.totalWeight += currentGoodWeight;
          wagon.goodWeight += currentGoodWeight;
        });
      }
    });
  }

  protected onSelectTypeOfWagon(wagonType: WagonType, idx: number) {
    if ((!this.railOrder.wagonInformation[idx].goods || !this.railOrder.wagonInformation[idx].goods[0]) && wagonType) {
      this.railOrder.wagonInformation[idx].goods[0] = initialGoodMinimal();
    }

    this.railOrder.wagonInformation[idx].typeOfWagon = wagonType ? wagonType.code : null;
    this.updateRailOrder.emit(this.railOrder);
  }

  protected onSelectNhmCode(nhmCode: GoodModel, idx: number) {
    this.wagonTypeResultLists[idx] = [];
    if ((!this.railOrder.wagonInformation[idx].goods || !this.railOrder.wagonInformation[idx].goods[0]) && nhmCode) {
      this.railOrder.wagonInformation[idx].goods[0] = initialGoodMinimal();
    }

    if(this.railOrder.wagonInformation[idx].goods[0]) {
      this.railOrder.wagonInformation[idx].goods[0].nhmCode = nhmCode?.nhmCode;
      this.railOrder.wagonInformation[idx].goods[0].nhmDescription = nhmCode?.description?.substring(0, 350);
    }
    this.updateRailOrder.emit(this.railOrder);
  }

  protected getWagonTypeAutocomplete(input: string, index: number): void {
    this.trainorderService.getWagonInfo(input).then((result: WagonCodes) => {
      if (result && result && result.length > 0) {
        this.wagonTypeResultLists[index] = [];
        for (let s of result) {
          this.wagonTypeResultLists[index].push({code: s});
        }
        this.wagonTypeResultLists[index] = this.wagonTypeResultLists[index].slice(0, 30).sort((a, b) => ((a.name ? a.name : '') > (b.name ? b.name : '') ? 1 : -1));
      }
    });
  }

  protected getNhmCodeAutocomplete(input: any): void {
    if (input.length >= 3 && !this.nhmCodeAutocomplete.find((elem) => elem.nhmCode === input)) {
      this.trainorderService.getCargoInfo(input, 6).then((result: ApiGoodResponse) => {
        this.nhmCodeAutocomplete = result.slice(0, 30).sort((a, b) => (a.nhmCode > b.nhmCode ? 1 : -1));
      });
    }
  }

  protected onBlurWagonNumber = (event: any) => {
    const idx = event.target.name.split('_')[1];
    this.getWagonNumber(idx).setValue(this.wagonNumberPipe.transform(this.railOrder.wagonInformation[idx].wagonNumber), {emitEvent: false});
    const wagonNumber = this.railOrder.wagonInformation[idx].wagonNumber;
    if(wagonNumber && wagonNumber.length == 12) {
      this.getVehicleDetails(wagonNumber).subscribe({
        next: result => {
          const typeOfWagon = result?.technicalAttributes?.internationalFreightWagonClass;
          const typeOfWagonControl = this.getTypeOfWagon(idx);
          const typeOfWagonObject = {
            code: typeOfWagon,
            name: typeOfWagon
          }
          this.railOrder.wagonInformation[idx].typeOfWagon = typeOfWagon;
          typeOfWagonControl.setValue(typeOfWagonObject.code);
        },
        error: err => {
          if(err.status == HttpStatusCode.NotFound) {
            console.log(`wagon information for wagon with number ${wagonNumber} not found.`);
          } else {
            throw err;
          }
        }
      });
    }
  }

  protected get numberOfWagons(): FormControl {
    return this.fastEntryForm.get('numberOfWagons') as FormControl;
  }
  protected get wagonInformation(): FormArray {
    return this.fastEntryForm.get('wagonInformation') as FormArray;
  }

  protected getWagonInformationAt(idx: number): FormGroup {
    return this.wagonInformation.at(idx) as FormGroup;
  }

  protected getWagonNumber(idx: number): FormControl {
    return this.getWagonInformationAt(idx).get('wagonNumber') as FormControl;
  }

  protected getTypeOfWagon(idx: number): FormControl {
    return this.getWagonInformationAt(idx).get('typeOfWagon') as FormControl;
  }

  protected getLoadingStatus(idx: number): FormControl {
    return this.getWagonInformationAt(idx).get('loadingStatus') as FormControl;
  }

  protected getWeight(idx: number): FormControl {
    return this.getWagonInformationAt(idx).get('weight') as FormControl;
  }

  protected getAdditionalDescription(idx: number): FormControl {
    return this.getWagonInformationAt(idx).get('additionalDescription') as FormControl;
  }

  protected getNhmCode(idx: number): FormControl {
    return this.getWagonInformationAt(idx).get('nhmCode') as FormControl;
  }

  protected importWagonInformation(): void {
    this.wagonImportDialogRef = this.newOrderWagonImportService.openWagonImportDialog(this.railOrder);

    this.wagonImportDialogRef.afterClosed().subscribe({
      next: (wagonInformationList: WagonInformation[] | undefined) => {
        if (wagonInformationList && wagonInformationList.length > 0) {
          wagonInformationList.forEach((newWagon, index) => {
            const existingWagon = this.railOrder.wagonInformation[index];

            if (existingWagon) {
              // Update existing wagon
              this.railOrder.wagonInformation[index] = newWagon;
            } else {
              // Append new wagon
              this.railOrder.wagonInformation.push(newWagon);
            }

            const wagonNumber = newWagon?.wagonNumber;
            if (wagonNumber) {
              this.fetchAndSetWagonDetails(wagonNumber, index);
            }
          });

          this.updateWagonInformation();
          this.calculateWeights();

          //this.formFieldService.disableFields(this.formGroup, 'wagonData', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
        }
      },
      error: (err) => {
        console.error('Error occurred while importing wagon information:', err);
      },
    });
  }

  private updateWagonInformation() {
    this.wagonInformation.clear();
    this.initWagonInformation();
  }

  private fetchAndSetWagonDetails(wagonNumber: string, index: number): void {
    this.getVehicleDetails(wagonNumber).subscribe({
      next: result => {
        const typeOfWagon = result?.technicalAttributes?.internationalFreightWagonClass;
        if (typeOfWagon) {
          const typeOfWagonObject = { code: typeOfWagon, name: typeOfWagon };

          // Ensure index is within bounds
          if (index >= 0 && index < this.railOrder.wagonInformation.length) {
            this.railOrder.wagonInformation[index].typeOfWagon = typeOfWagon;
            this.getTypeOfWagon(index)?.setValue(typeOfWagonObject.code);
          }
        }
      },
      error: (err) => {
        console.error(`Error fetching details for wagon ${wagonNumber}:`, err);
      }
    });
  }

  private getVehicleDetails(wagonNumber: string): Observable<Vehicle> {
    const vehicleByVehicleNumberRequest: VehicleByVehicleNumberRequest = {
      VehicleNumber: wagonNumber
    };
    return this.vehicleDetailsService.getVehicleDataByVehicleNumber(vehicleByVehicleNumberRequest);
  }
}
