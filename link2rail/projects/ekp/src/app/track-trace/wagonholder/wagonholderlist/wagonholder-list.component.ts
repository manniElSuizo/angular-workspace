import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VehicleSummaryForVehicleKeeper } from '../models/ApiWagonholderList.models';
import { WagonholderListFilterComponent } from './wagonholder-list-filter/wagonholder-list-filter.component';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';
import { VehicleDetailsDialogService } from '@src/app/shared/components/vehicle-details/service/vehicle-details-dialog.service';
import { TableHeader } from '@src/app/shared/models/table';

@Component({
  selector: 'app-wagonholder-list',
  templateUrl: './wagonholder-list.component.html',
  styleUrl: './wagonholder-list.component.scss'
})

export class WagonholderListComponent implements OnInit, AfterViewChecked, AfterViewInit {
  @ViewChild(WagonholderListFilterComponent, { static: false }) filter!: WagonholderListFilterComponent;

  protected tableHeaders: TableHeader[] = [];

  constructor(
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private vehicleDetailsDialogService : VehicleDetailsDialogService
  ) {
    this.createTableHeaders();

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }

  protected sortTable(fieldName: string): void {
    this.filter?.sort(fieldName);
  }

  protected loadMore() {
    this.filter.loadMore();
  }

  private createTableHeaders(): void {
    this.tableHeaders = [
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Wagonkeeper'),
        fieldName: 'wagonKeeper',
        sortable: true,
        minWidth: '220px',
        maxWidth: '220px',
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Wagonnumber'),
        fieldName: 'wagonNumber',
        sortable: true,
        minWidth: '220px',
        maxWidth: '220px',
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Wagoncategory'),
        fieldName: 'wagonCategory',
        sortable: true,
        minWidth: '220px',
        maxWidth: '220px',
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Trackingstatus'),
        fieldName: 'trackingStatus',
        sortable: true
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Trackingstatusdate'),
        fieldName: 'trackingStatusDate',
        sortable: true,
        minWidth: '220px',
        maxWidth: '220px',
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Country'),
        fieldName: 'country',
        sortable: true,
        minWidth: '220px',
        maxWidth: '220px',
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Location'),
        fieldName: 'location',
        sortable: true
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Runability'),
        fieldName: 'runability',
        sortable: true,
        minWidth: '250px',
        maxWidth: '250px',
      },
      {
        headerText: this.translate.instant('Wagonholder-component.Table-header.Damagecode'),
        fieldName: 'damageCode',
        sortable: true,
        minWidth: '220px',
        maxWidth: '220px',
      },
    ]
  }

  get sortConditions(): SortConditionsModel | null | undefined {
    return this.filter?.sortConditions && this.filter?.sortConditions.length > 0 ? this.filter?.sortConditions[0] : {asc: true, field: 'not existing field'};
  }

  get vehicleSummariesForVehicleKeeper(): VehicleSummaryForVehicleKeeper[] {
    return this.filter?.vehicleSummariesForVehicleKeeper;
  }

  protected getTooltip(vehiclenumber: string): string {
       return vehiclenumber?this.translate.instant('Wagonholder-component.Tooltip.Open-wagon-details') + vehiclenumber :null;
  }

  protected openWagonInfoModal(vehiclenumber: string): void {
    this.vehicleDetailsDialogService.showVehicleDetalsDialog(vehiclenumber.replace(/\D/g, ''));
  }

}
