import { AfterViewInit, ChangeDetectorRef, Component, inject, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { SectionName } from '../../enums/order-enums';
import { initalWagonInformation, initialGood, RailOrder, WagonInformation } from '../../../../models/rail-order-api';
import { SectionBase } from '../section.base';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { LoadingStatusOption } from '../../models/api-loading-status';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { ApiGoodResponse, GoodModel, WagonCodes, WagonType } from '@src/app/trainorder/models/Cargo.model';
import { NewOrderWagonDetailDialogComponent } from './new-order-wagon-detail-dialog/new-order-wagon-detail-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { NewOrderWagonDetailDialogService } from './service/new-order-wagon-detail-dialog.service';
import { FormFieldService } from '../../service/form-field.service';
import { ValidationMode } from '../../validators/validator-field.config';
import { Vehicle, VehicleByVehicleNumberRequest } from '@src/app/shared/components/vehicle-details/models/vehicle-details.model';
import { VehicleDetailsService } from '@src/app/shared/components/vehicle-details/service/vehicle-details.service';
import { NewOrderWagonImportDialogComponent } from './new-order-wagon-import-dialog/new-order-wagon-import-dialog.component';
import { NewOrderWagonImportDialogService } from './service/new-order-wagon-import-dialog.service';
import { WagonNumberPipe } from '@src/app/shared/pipes/wagon-number.pipe';
import { HttpStatusCode } from '@angular/common/http';
import { OrderTemplateCachingService } from '../../service/order-template-caching.service';
@Component({
  selector: 'app-new-order-wagon-data',
  templateUrl: './new-order-wagon-data.component.html',
  styleUrls: ['../../new-order-main/new-order-main.component.scss',
    './new-order-wagon-data.component.scss']
})
export class NewOrderWagonDataComponent extends SectionBase implements OnInit, AfterViewInit, OnDestroy {
  @Input() currentSectionName: SectionName;
  @Input() editMode: boolean;
  @Input() validationStage: ValidationMode;
  @Input() isNew: boolean;

  protected nhmCodeAutocomplete: GoodModel[] = [];
  protected loadingStatusOptions: LoadingStatusOption[] = [
    { value: true, label: 'Shared.Loading-state-loaded' },
    { value: false, label: 'Shared.Loading-state-empty' }
  ];

  public formGroup: FormGroup;
  protected SectionName = SectionName;
  protected numbersOfWagonsList: number[] = [];
  protected railOrder: RailOrder;
  protected isAnyWagonSelected = false;
  protected totalWeight: number = 0;
  protected wagonTypeResultLists: WagonType[][] = new Array<WagonType[]>();

  private fieldValueChangeSubscriptions: Subscription = new Subscription();
  private subscriptionNhmCodeAutoComplete: Subscription = new Subscription();
  private nhmCodeInputChange: Subject<string> = new Subject<string>();
  private wagonTypeInputChange: Subject<string> = new Subject<string>();
  private wagonDetailDialogRef: MatDialogRef<NewOrderWagonDetailDialogComponent> = null;
  private wagonImportDialogRef: MatDialogRef<NewOrderWagonImportDialogComponent> = null;
  private formFieldService: FormFieldService = inject(FormFieldService);

  constructor(private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private newOrderWagonDetailService: NewOrderWagonDetailDialogService,
    private newOrderWagonImportService: NewOrderWagonImportDialogService,
    private trainorderService: TrainorderService,
    private vehicleDetailsService: VehicleDetailsService,
    private orderTemplateCachingService: OrderTemplateCachingService,) {
    super();
  }

  public ngOnInit(): void {
    this.createForm();
    this.loadLists();
    this.subscriptionNhmCodeAutoComplete.add(this.nhmCodeInputChange.pipe(debounceTime(500)).subscribe((input) => {
      this.getNhmCodeAutocomplete(input);
    }));
  }

  ngAfterViewInit() {
    if (!this.editMode) {
      this.formGroup.disable();
    }
  }

  ngOnDestroy(): void {
    this.fieldValueChangeSubscriptions.unsubscribe();
  }

  protected getWagonInformationFormGroup(index: number): FormGroup {
    return this.wagonInformationList.at(index) as FormGroup;
  }

  protected getErrorKeys(errors: { [key: string]: any }): string[] {
    return Object.keys(errors);
  }

  protected get wagonInformationList(): FormArray {
    return this.formGroup?.get('wagonInformationList') as FormArray || this.fb.array([]);
  }

  protected getWagon = (index: number): FormControl => {
    this.getWagonErrors(index);
    return this.wagonInformationList.at(index) as FormControl;
  }
  protected getWagonErrors = (index: number): ValidationErrors => {
    return this.wagonInformationList.at(index).errors as ValidationErrors;
  }

  protected getWagonNumber(index: number): FormControl {
    return this.wagonInformationList.at(index).get('wagonNumber') as FormControl;
  }

  protected getFirstGoodWeight(index: number): FormControl {
    return this.wagonInformationList.at(index).get('firstGoodWeight') as FormControl;
  }

  protected getTypeOfWagon(index: number): FormControl {
    return this.wagonInformationList.at(index).get('typeOfWagon') as FormControl;
  }

  protected getfirstGoodAdditionalDescription(index: number): FormControl {
    return this.wagonInformationList.at(index).get('firstGoodAdditionalDescription') as FormControl;
  }

  protected getFirstGoodNhmCode(index: number): FormControl {
    return this.wagonInformationList.at(index).get('firstGoodNhmCode') as FormControl;
  }

  protected getLoadingStatus(index: number): FormControl {
    return this.wagonInformationList.at(index).get('loadingStatus') as FormControl;
  }

  protected getCheckboxWagon(index: number): FormControl {
    return this.wagonInformationList.at(index).get('checkboxWagon') as FormControl;
  }

  public updateRailOrder(ro: RailOrder) {
    this.railOrder = ro;
    if (!this.railOrder.wagonInformation || this.railOrder.wagonInformation.length < 1) {
      this.railOrder.wagonInformation = [JSON.parse(JSON.stringify(initalWagonInformation()))];
    }
    this.setFormValues();
    this.formFieldService.disableFields(this.formGroup, 'wagonData', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
    this.cd.detectChanges();
  }

  private getNumberOfWagons(): number {
    return this.railOrder?.wagonInformation?.length || 1;
  }
  private createForm(): void {
    this.formGroup = this.fb.group({
      numberOfWagons: this.getNumberOfWagons(),
      wagonInformationList: this.fb.array([])
    });
  }

  private updateWagonInformationList(): void {
    const wagonArray = this.formGroup.get('wagonInformationList') as FormArray;
    wagonArray.clear();
    this.wagonTypeResultLists = new Array();
    this.railOrder.wagonInformation.forEach(wagon => {
      wagonArray.push(this.fb.group({
        wagonNumber: this.fb.control(wagon?.wagonNumber ? new WagonNumberPipe().transform(wagon.wagonNumber) : null),
        typeOfWagon: wagon?.typeOfWagon,
        loadingStatus: wagon?.loadingStatus,
        checkboxWagon: false,
        firstGoodWeight: wagon?.goods[0]?.weight,
        firstGoodAdditionalDescription: wagon?.goods[0]?.additionalDescription,
        firstGoodNhmCode: this.zeroPadNhm(wagon?.goods[0]?.nhmCode),
      }));
      this.wagonTypeResultLists.push([]);
    });
  }

  private zeroPadNhm(nhmCode: string): string {
    if (!nhmCode) {
      return null;
    }
    let nhm = nhmCode;
    while (nhm.length < 6) {
      nhm = '0' + nhm;
    }
    return nhm;
  }

  protected get numberOfWagons(): FormControl {
    return this.formGroup.get('numberOfWagons') as FormControl;
  }
  protected set numberOfWagons(value: number) {
    if (this.formGroup.get('numberOfWagons')) {
      this.formGroup.get('numberOfWagons')?.setValue(value);
    }
  }

  private loadLists() {
    for (let i = 1; i <= 99; i++) {
      this.numbersOfWagonsList.push(i);
    }
  }

  protected validate(): string[] {
    console.log('validate Wagon information section');
    return [];
  }

  protected autocompleteInputChanged(event: any, field: string): void {
    switch (field) {
      case 'nhm-code':
        this.nhmCodeInputChange.next(event.target.value);
        break;
      case 'wagon-type':
        this.wagonTypeInputChange.next(event.target.value);
        break;
      default:
        break;
    }
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

  protected onSelectWagonData(wagonType, i): void {
    console.log("wagonType", wagonType);
    if ((!this.railOrder.wagonInformation[i].goods || !this.railOrder.wagonInformation[i].goods[0]) && wagonType) {
      this.railOrder.wagonInformation[i].goods[0] = initialGood();
    }

    this.railOrder.wagonInformation[i].typeOfWagon = wagonType ? wagonType.code : null;
  }

  protected cargoWagonTypeHasNoData(idx: number): boolean {
    const control = this.formGroup.get('wagonInformationList')['controls'][idx]?.get('typeOfWagon');
    if (control.touched && control.value.length < 3 && control.value.length > 0) {
      return true;
    }
    return control.hasError('nodata');
  }

  protected trackByFn(index: any, item: any): any {
    return index;
  }

  protected setLoadingStatus(idx: number): void {
    const loadingStatus = (this.formGroup.get('wagonInformationList') as FormArray).controls[idx]?.get('loadingStatus')?.value;

    if (loadingStatus.toLowerCase() === "true") {
        this.railOrder.wagonInformation[idx].loadingStatus = true;
    } else if (String(loadingStatus).toLowerCase() === "false") {
        this.railOrder.wagonInformation[idx].loadingStatus = false;
    } else {
        this.railOrder.wagonInformation[idx].loadingStatus = null;
    }
}


  protected setWagonType(idx: number): void {
    const wagonType = this.formGroup.get('wagonInformationList')['controls'][idx]?.get('typeOfWagon')?.value;
    if (wagonType) {
      if (!this.railOrder.wagonInformation[idx].goods || !this.railOrder.wagonInformation[idx].goods[0]) {
        this.railOrder.wagonInformation[idx].goods[0] = initialGood();
      }
      this.railOrder.wagonInformation[idx].typeOfWagon = wagonType;
    } else {
      this.railOrder.wagonInformation[idx].typeOfWagon = null
    }
  }

  protected setFirstGoodAdditionalDescription(idx: number): void {
    const wagonInfo = this.railOrder.wagonInformation[idx];
    if (!wagonInfo) {
        return;
    }

    const firstGoodAdditionalDescription = (this.formGroup.get('wagonInformationList') as FormArray).controls[idx]?.get('firstGoodAdditionalDescription')?.value;

    if (firstGoodAdditionalDescription || firstGoodAdditionalDescription !== '') {
        if (!wagonInfo?.goods || !wagonInfo?.goods[0]) {
            wagonInfo.goods[0] = initialGood();
        }
        wagonInfo.goods[0].additionalDescription = firstGoodAdditionalDescription;
    } else if (wagonInfo?.goods?.[0]) {
        wagonInfo.goods[0].additionalDescription = null;
    }
}


  protected setFirstGoodWeight(idx: number): void {
    const firstGoodWeight = this.formGroup.get('wagonInformationList')['controls'][idx]?.get('firstGoodWeight')?.value;

    if ((!this.railOrder.wagonInformation[idx].goods || !this.railOrder.wagonInformation[idx].goods[0]) && firstGoodWeight) {
      this.railOrder.wagonInformation[idx].goods[0] = initialGood();
    }

    if (this.railOrder.wagonInformation[idx].goods[0]) {
      this.railOrder.wagonInformation[idx].goods[0].weight = firstGoodWeight;
    }

    this.calculateWeights();
  }

  protected setFirstNhmCode(idx: number): void {
    const selectedNhmCode = (this.formGroup.get('wagonInformationList') as FormArray).controls[idx]?.get('firstGoodNhmCode')?.value;

    if (selectedNhmCode) {
      const selectedOption = this.nhmCodeAutocomplete.find(option => option.nhmCode === selectedNhmCode);

      if (selectedOption) {
        if (!this.railOrder.wagonInformation[idx].goods || !this.railOrder.wagonInformation[idx].goods[0]) {
          this.railOrder.wagonInformation[idx].goods[0] = initialGood();
        }

        this.railOrder.wagonInformation[idx].goods[0].nhmCode = selectedNhmCode;
        this.railOrder.wagonInformation[idx].goods[0].nhmDescription = selectedOption.description.substring(0, 350); // Store description
      }
    }
}


  protected setWagonNumber(idx: number): void {
    const wagonNumber = this.formGroup.get('wagonInformationList')['controls'][idx]?.get('wagonNumber')?.value;
    const cleanWagonNumber = wagonNumber?.replace(/\D/g, '') || null;
    if (cleanWagonNumber && cleanWagonNumber.length == 12) {

      this.railOrder.wagonInformation[idx].wagonNumber = cleanWagonNumber;

      const formatedWagonNumber = new WagonNumberPipe().transform(cleanWagonNumber);
      this.formGroup.get('wagonInformationList')['controls'][idx]?.get('wagonNumber')?.setValue(formatedWagonNumber);

      this.getVehicleDetails(cleanWagonNumber).subscribe({
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

  private getVehicleDetails(wagonNumber: string): Observable<Vehicle> {
    const vehicleByVehicleNumberRequest: VehicleByVehicleNumberRequest = {
      VehicleNumber: wagonNumber
    };
    return this.vehicleDetailsService.getVehicleDataByVehicleNumber(vehicleByVehicleNumberRequest);
  }

  getNhmCodeAutocomplete(input: any): void {
    if (input.length >= 3 && !this.nhmCodeAutocomplete.find((elem) => elem.nhmCode === input)) {
      this.trainorderService.getCargoInfo(input, 6).then((result: ApiGoodResponse) => {
        // Take only 30 answers that fit (array may be 1000+ in length), otherwise it takes a lot of resources to build these elements
        this.nhmCodeAutocomplete = result.slice(0, 30).sort((a, b) => (a.nhmCode > b.nhmCode ? 1 : -1));
      });
    }
  }

  protected calculateTotalWeightForm() {
    this.totalWeight = 0;

    const wagonFormArray = this.formGroup.get('wagonInformationList') as FormArray;
    if (wagonFormArray) {
      for (let i = 0; i < wagonFormArray.length; i++) {
        const wagonGroup = wagonFormArray.at(i) as FormGroup;
        const firstGoodWeight = wagonGroup.get('firstGoodWeight')?.value || 0;
        this.totalWeight += Number(firstGoodWeight);
      }
    }
    this.formGroup.get('totalWeight')?.setValue(this.totalWeight);
  }

  /**
   * calculates the total weight for display in frontend,
   * the total goodWeight per wagon
   * and
   * the total loadingTakle weight per wagon
   */
  private calculateWeights(): void {
    this.totalWeight = 0;

    for (let wagon of this.railOrder.wagonInformation) {
      if (wagon?.loadingTackles && wagon?.loadingTackles?.length > 0) {
        wagon.loadingTacklesWeight = 0;
        for (const loadingTackles of wagon.loadingTackles) {
          const currentloadingTackleWeight = loadingTackles.weight || 0;
          this.totalWeight += Number(currentloadingTackleWeight);
          wagon.loadingTacklesWeight += Number(currentloadingTackleWeight);
        }
      }

      if (wagon?.goods && wagon?.goods?.length > 0) {
        wagon.goodWeight = 0;
        for (const good of wagon.goods) { // Loop through all goods in the wagon
          const currentGoodWeight = good.weight || 0;
          this.totalWeight += Number(currentGoodWeight); // Add the weight to the total
          wagon.goodWeight += Number(currentGoodWeight);
        }
      }
    }
  }

  protected addCheckboxWagonSubscription(checkboxWagon: FormControl): void {
    if (checkboxWagon) {
      const sub = checkboxWagon.valueChanges.subscribe(() => {
        this.isWagonSelected();
      });
      this.fieldValueChangeSubscriptions.add(sub);
    }
  }

  protected formatToTwoDecimals(index: number, controlName: string): void {
    const control = this.wagonInformationList.at(index).get(controlName) as FormControl;
    if (control && control.value) {
      const value = parseFloat(control.value);
      if (!isNaN(value)) {
        control.setValue(value.toFixed(2));
      }
    }
  }

  protected adjustWagonList(): void {
    const numberOfWagons = this.formGroup.get('numberOfWagons').value;
    const wagonInformationList = this.formGroup.get('wagonInformationList') as FormArray;
    const currentWagonCount = wagonInformationList.controls.length;

    if (numberOfWagons > currentWagonCount) {
      for (let i = currentWagonCount; i < numberOfWagons; i++) {
        this.addNewLine();
      }
    } else if (numberOfWagons < currentWagonCount) {
      while (wagonInformationList.length > numberOfWagons) {
        this.removeLine(wagonInformationList.length - 1);
      }
    }
    this.calculateWeights();
  }

  private createWagonFormGroup(): FormGroup {
    const hasAC = this.railOrder?.templateNumber?.trim()
    let wagonInfo: WagonInformation = initalWagonInformation();

    if (hasAC && this.railOrder.wagonInformation && this.railOrder.wagonInformation.length) {
      const wagonInfoTemplate = this.orderTemplateCachingService.getOrderTemplate().wagonInformation[0];
      wagonInfo = this.cloneWagonInformation(wagonInfoTemplate);
      this.resetWeightsInWagon(wagonInfo);
    }

    this.railOrder.wagonInformation.push(wagonInfo);
    const itemGroup: FormGroup = this.newWagonFormGroup(wagonInfo);
    return itemGroup;
  }

  private resetWeightsInWagon(wagon: WagonInformation): void {
    if (wagon.goods) {
      wagon.goods.forEach(good => good.weight = null);
    }
  }

  private newWagonFormGroup(wagonInfo: WagonInformation = null) {
    const itemGroup: FormGroup = this.fb.group({
      checkboxWagon: new FormControl(),
      wagonNumber: new FormControl(wagonInfo?.wagonNumber),
      loadingStatus: new FormControl(wagonInfo?.loadingStatus),
      typeOfWagon: new FormControl(wagonInfo?.typeOfWagon),
      firstGoodWeight: new FormControl(wagonInfo?.goods.at(0)?.weight),
      firstGoodAdditionalDescription: new FormControl(wagonInfo?.goods.at(0)?.additionalDescription),
      firstGoodNhmCode: new FormControl(wagonInfo?.goods.at(0)?.nhmCode)
    });

    const checkboxWagonControl = itemGroup.get('checkboxWagon') as FormControl;
    this.addCheckboxWagonSubscription(checkboxWagonControl);
    return itemGroup;
  }

  protected openEditWindow(idx: number) {
    this.wagonDetailDialogRef = this.newOrderWagonDetailService.openWagonDetailDialog(this.railOrder, idx, this.editMode, this.validationStage);
    this.wagonDetailDialogRef.afterClosed().subscribe({
      next: (wagonInformation: WagonInformation) => {
        //console.log(wagonInformation);
        if (wagonInformation) {
          this.railOrder.wagonInformation[idx] = wagonInformation;
          this.setFormValues();
        }
        this.formFieldService.disableFields(this.formGroup, 'wagonData', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
      }
    });
  }

  private setFormValues(): void {
    this.updateWagonInformationList();
    this.numberOfWagons.setValue(this.getNumberOfWagons(), {emitEvent: false});
    this.calculateWeights();
  }

  private addNewLine(): void {
    if (this.wagonInformationList?.length > 99) {
      return;
    }
    this.wagonTypeResultLists.push([]);
    const itemGroup: FormGroup = this.createWagonFormGroup();
    this.wagonInformationList.push(itemGroup);
    this.numberOfWagons = this.wagonInformationList.length;
    this.formFieldService.disableFields(this.formGroup, 'wagonData', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  private cloneWagonInformation(wagonInformation: WagonInformation): WagonInformation {
    const newWagon = JSON.parse(JSON.stringify(wagonInformation));
    delete newWagon.transportPlanId;

    if(newWagon?.referenceId) {
      delete newWagon.referenceId;
    }

    delete newWagon.wagonIdentifier;
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

  protected copyWagon(index: number): void {
    // Create a deep copy of the selected wagon object
    const wagonInfo = this.railOrder.wagonInformation[index];
    const newWagon = this.cloneWagonInformation(wagonInfo);

    // Add the modified newWagon to the wagonInformation list
    this.railOrder.wagonInformation.push(newWagon);

    // Add corresponding empty array to the wagonTypeResultLists
    this.wagonTypeResultLists.push([]);

    // Push a new form group for the new wagon to the wagonInformationList
    this.wagonInformationList.push(this.newWagonFormGroup(newWagon));

    // Recalculate the weights for the updated wagon information
    this.calculateWeights();

    // Update the number of wagons
    this.numberOfWagons = this.railOrder.wagonInformation.length;

    // Disable fields based on the current form state (editMode, etc.)
    this.formFieldService.disableFields(this.formGroup, 'wagonData', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
  }

  protected isWagonSelected(): void {
    this.isAnyWagonSelected = this.wagonInformationList.controls.some(control => control.get('checkboxWagon')?.value);
  }

  protected removeSelectedWagons(): void {
    const wagonInformationList = this.formGroup.get('wagonInformationList') as FormArray;
    const indicesToRemove: number[] = [];
    wagonInformationList.controls.forEach((control, index) => {
      if (control.get('checkboxWagon')?.value) {
        indicesToRemove.push(index);
      }
    });

    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      if (wagonInformationList.length > 1) {
        wagonInformationList.removeAt(indicesToRemove[i]);
        this.railOrder.wagonInformation.splice(indicesToRemove[i], 1);
      }
    }
    this.resetWagonTypeResultLists();
    this.numberOfWagons = this.wagonInformationList.length;
  }

  private resetWagonTypeResultLists() {
    this.wagonTypeResultLists = new Array();
    this.wagonInformationList.controls.forEach(form => this.wagonTypeResultLists.push([]));
  }

  protected isAddWagonDisabled(): boolean {
    if (this.editMode) {
      if (this.wagonInformationList && this.wagonInformationList.length < 99) {
        return false;
      } else {
        return true;
      }
    }
    return true;

  }
  protected removeLine(idx: number): void {
    if (this.wagonInformationList.length > 1) {
      this.wagonInformationList.removeAt(idx);
      this.railOrder.wagonInformation.splice(idx, 1);
    }
    this.resetWagonTypeResultLists();

    this.calculateWeights();
    this.numberOfWagons = this.wagonInformationList.length;
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

          this.setFormValues();
          this.formFieldService.disableFields(this.formGroup, 'wagonData', this.railOrder, this.editMode, this.railOrder.orderId ? false : true);
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error occurred while importing wagon information:', err);
      },
    });
  }

  private fetchAndSetWagonDetails(wagonNumber: string, index: number): void {
    const cleanWagonNumber = wagonNumber?.replace(/\D/g, '') || null;
    if (cleanWagonNumber && cleanWagonNumber.length == 12) {
      this.getVehicleDetails(cleanWagonNumber).subscribe({
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
  }
}
