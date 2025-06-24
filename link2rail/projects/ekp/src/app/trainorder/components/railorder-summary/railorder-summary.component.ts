import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { RailorderSummary, RailorderSummaryCalculation, WagonSummary } from '@src/app/trainorder/models/ApiRailOrder.model';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { ApiGoodResponse } from '@src/app/trainorder/models/Cargo.model';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';
import { SharedModule } from '@src/app/shared/shared.module';
import { TrainorderService } from '../../services/trainorder.service';
import { NhmCodeDetailsComponent } from '../order/nhm-code-details/nhm-code-details.component';

@Component({
  selector: 'app-railorder-summary',
  standalone: true,
  templateUrl: './railorder-summary.component.html',
  styleUrl: './railorder-summary.component.scss',
  imports: [
    SharedModule,
    MatDialogModule
  ]
})
export class RailorderSummaryComponent implements OnInit {
  public static modalWidth = 1850;
  protected modalWidthMember = RailorderSummaryComponent.modalWidth + 'px';

  protected formGroup: FormGroup;
  protected closeDialogTranslation: string;

  protected railorderSummary: RailorderSummary;
  protected railorderSummaryList: RailorderSummary[];
  protected tableHeaders: any[] = [];

  protected calulations :RailorderSummaryCalculation = {
    wagonCount: 0,
    sumCargoWeight: 0,
    sumVehicleWeight: 0,
    sumTotalWeight: 0,
    sumLength: 0,
    axesCount: 0
  }

  protected sortConditions: SortConditionsModel = {field: null, asc: null};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { railorderSummaryList: RailorderSummary[] },
    private translate: TranslateService,
    private trainorderService: TrainorderService,
    private modalWindows: ModalWindows,

  ) {
    this.railorderSummaryList = data.railorderSummaryList;
    this.railorderSummary = data.railorderSummaryList[0];
    this.calculateSummaryResults();
    this.createTableHeaders();
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Wagon-number'),
        value: 'wagonNumber',
        width: '162px',
        sortable: true
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Wagon-type'),
        value: 'wagonType',
        width: '123px',
        sortable: true
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Shipping-date'),
        value: 'shippingDate',
        width: '114px',
        sortable: true
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Consignor'),
        value: 'consignor',
        sortable: true
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Consignee'),
        value: 'consignee',
        sortable: true
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Good-type'),
        value: 'nhmCode',
        width: '72px',
        sortable: true
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Cargo-weight'),
        value: 'cargoWeight',
        width: '94px'
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Vehicle-weight'),
        value: 'vehicleWeight',
        width: '94px'
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Total-weight'),
        value: 'toatalWeight',
        width: '94px'
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Number-of-axis'),
        value: 'numberOfAxis',
        width: '70px'
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Length'),
        value: 'length',
        width: '94px'
      },
      {
        text: this.translate.instant('Railorder-summary-component.Table-header.Order-number'),
        value: 'orderNumber',
        width: '250px',
        sortable: true
      }
    ];
  }

  protected getGoodType(nhmCode: string) {
    if(!nhmCode) return null;
    return nhmCode.length >= 4 ? nhmCode.substring(0, 4) : null;
  }

  protected calcMeter(millimeter: number): number {
    if (!isNaN(millimeter)) return (millimeter / 1000);
    return 0;
  }

  ngOnInit(): void {
    this.createRailorderChainSelectboxModel();
    this.sortTable("orderNumber", true);
  }

  createRailorderChainSelectboxModel() {
    if (!this.isTrainChain()) return;

    this.formGroup = new FormGroup({
      railorderSummarySelector: new FormControl(0)
    });

    this.formGroup.get('railorderSummarySelector').setValue(this.railorderSummaryList[0]);

    this.formGroup.get('railorderSummarySelector').valueChanges.subscribe(((selected: RailorderSummary) => {
      this.sortTable(this.sortConditions.field, this.sortConditions.asc);
      this.railorderSummary = selected;
      this.calculateSummaryResults();
    }));
  }

  protected isTrainChain() {
    if (this.railorderSummaryList.length > 1) return true;
    return false;
  }

  protected openNhmDetailsModal(nhmCode: string, orderNumber): void {
    nhmCode = this.getGoodType(nhmCode);

    nhmCode = nhmCode.padEnd(8, '0');
    const strArr: string[] = [nhmCode];

    this.trainorderService.getNHMCodeDetails(strArr).subscribe((result: ApiGoodResponse) => {
      this.modalWindows.openModalWindow(NhmCodeDetailsComponent, { nhmCodes: result, zabOrderNumber: orderNumber });
    });
  }



  protected scrollToTop(){
    const element = document.getElementById("wagon-table");
    console.log("element", element);
    // element.scroll({
    //   top: 0,
    //   left: 0,
    //   behavior: "smooth",
    // });
    // element.scrollTo({
    //     top: 0,
    //     left: 0,
    //     behavior: "smooth",
    //   });
    // element.style.top = "0";
    element.scrollIntoView();
  }

  protected sortTable(header: string, asc: boolean) {
    this.setSortConditions(header, asc);
    this.railorderSummary.wagons.sort((a: WagonSummary, b: WagonSummary) => {
      if (a[header] < b[header]) return asc ? 1 : -1;
      if (a[header] > b[header]) return asc ? -1 : 1;
      return 0;
    });
  }

  private setSortConditions(field: string, asc: boolean) {
    this.sortConditions.field = field;
    this.sortConditions.asc = asc;
  }

 private calculateSummaryResults() {
    const wagons = this.railorderSummary.wagons;
    this.calulations.wagonCount = wagons.length;
    this.calulations.sumTotalWeight = wagons.reduce((sum, wagon) => sum + (wagon.totalWeight || 0), 0);
    this.calulations.sumCargoWeight = wagons.reduce((sum, wagon) => sum + (wagon.cargoWeight || 0), 0);
    this.calulations.sumVehicleWeight = wagons.reduce((sum, wagon) => sum + (wagon.vehicleWeight || 0), 0);
    this.calulations.axesCount = wagons.reduce((sum, wagon) => sum + (wagon.numberOfAxis || 0), 0);
    this.calulations.sumLength = wagons.reduce((sum, wagon) => sum + (wagon.length || 0), 0);
  }
}

