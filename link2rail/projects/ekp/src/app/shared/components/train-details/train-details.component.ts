import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TrainChain, TrainDetail } from '@src/app/trainorder/models/ApiTrainsDetail.model';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { SharedModule } from '../../shared.module';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';

enum CurrentSchedule {
    DAILY = 'DAILY',
    YEARLY = 'YEARLY',
    NONE = 'NONE'
}

interface SelectedTrainDetail extends TrainDetail {
    selected: boolean;
}

@Component({
    selector: 'app-train-details',
    templateUrl: './train-details.component.html',
    styleUrls: ['./train-details.component.scss'],
    standalone: true,
    imports: [
        SharedModule,
        ReactiveFormsModule,
        MatDialogModule
    ]
})
export class TrainDetailsComponent implements OnInit {
    protected currentSchedule: CurrentSchedule;
    private customerProfile: CustomerProfile | null = null;
    protected plannedDepartureTitle: Date | undefined;
    protected formGroup: FormGroup;
    protected loadingInProgress: boolean;
    protected trainChainTrains: SelectedTrainDetail[];
    protected trainChain: TrainChain;
    protected trainDetail: TrainDetail;
    protected constructionSitesCount: number =0;
    CurrentSchedule = CurrentSchedule;

    constructor(
        private storage: LocalStorageService,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: { trainDetail: TrainDetail | undefined, trainChain: TrainChain | undefined }) {

        this.trainChain = data.trainChain;
        this.trainDetail = data.trainDetail;
    }

    ngOnInit(): void {
        this.loadingInProgress = false;
        this.createTrainChainSelectboxModel();
        this.currentSchedule = CurrentSchedule.NONE;
        if (this.trainDetail) {
            if (this.trainDetail.timetableDaily.lengthMax && this.trainDetail.timetableDaily.weightMax) {
                this.currentSchedule = CurrentSchedule.DAILY;
            }
            else if (this.trainDetail.timetableYearly.lengthMax && this.trainDetail.timetableYearly.weightMax) {
                this.currentSchedule = CurrentSchedule.YEARLY;
            }
            if (this.currentSchedule == CurrentSchedule.DAILY) {
                this.plannedDepartureTitle = this.trainDetail.timetableDaily.plannedDeparture;
            } else if (this.currentSchedule == CurrentSchedule.YEARLY) {
                this.plannedDepartureTitle = this.trainDetail.timetableYearly.plannedDeparture;
            }
        } else if (this.isTrainChain()) {
            this.plannedDepartureTitle = new Date(this.trainChain.trains[0].train.startDate);
        }

        if (this.storage.getActiveProfiles()) {
            this.customerProfile = this.storage.getActiveProfiles()[0];
        } else {
            this.customerProfile = null;
        }
    }

    protected getConstructionSiteCount (detail: TrainDetail) : number {
        if (detail && detail.constructionSites && detail.constructionSites.length > 0) {
            return  detail.constructionSites.length
        }
        return 0;
    }

    protected hasConstructionSites(detail: TrainDetail): boolean {
        if (detail && detail.constructionSites && detail.constructionSites.length > 0) {
            this.constructionSitesCount = this.getConstructionSiteCount(detail);
            return true;

        }
        return false;
    }

    private createTrainChainSelectboxModel(): void {
        if (!this.isTrainChain()) return;

        this.trainChainTrains = new Array();

        this.formGroup = new FormGroup({
            trainChainItemSelector: new FormControl(0)
        });

        this.trainChain.trains.forEach((train: TrainDetail) => {
            const isSelected: boolean = this.selectedTrainChain(train);
            const seletedTrain: SelectedTrainDetail = { ...train, selected: isSelected };
            if (seletedTrain.selected) this.formGroup.get('trainChainItemSelector').setValue(seletedTrain);
            this.trainChainTrains.push(seletedTrain);
        });

        this.formGroup.get('trainChainItemSelector').valueChanges.subscribe(((selected: SelectedTrainDetail) => {
            this.trainDetail = selected;
        }));
    }
    protected selectedTrainChain(train: TrainDetail): boolean {
        if (train.train.productionDate === this.trainDetail.train.productionDate && train.train.trainNumber === this.trainDetail.train.trainNumber) return true;
        return false;
    }

    protected isTrainChain(): boolean {
        if (this.trainChain) {
            return true;
        }
        return false;
    }

    private profileSelected(): boolean {
        if (this.customerProfile) {
            return true;
        }
        return false;
    }

    protected createOrderStatusText(): string {
        if (this.profileSelected()) {
            if (this.trainDetail?.orderStatus) {
                switch (this.trainDetail?.orderStatus) {
                    case 'CANCELLATION_ACQUIRED': {
                        return 'CANCELLATION_ACQUIRED';
                    }
                    case 'CANCELLATION_IN_VALIDATION': {
                        return 'CANCELLATION_IN_VALIDATION';
                    }
                    case 'CANCELED': {
                        return 'canceled';
                    }
                    default: {
                        return 'ordered';
                    }
                }
            }
        }
        return '-';
    }

    protected translateStatus() {
        if (this.profileSelected()) {
            if (this.trainDetail?.orderStatus) {
                if (this.trainDetail?.orderStatus.includes('CANCEL')) {
                    return this.translate.instant('Order-view-page.Train-details-page.' + this.trainDetail.orderStatus);
                }
                return this.translate.instant('ordered');
            }
        }

        return '-';
    }

    protected toUpperOptionalString(s: string | undefined | null) {
        if (!s) return '';
        return s.toUpperCase();
    }
    protected showLableOriginally(stationType: string): boolean {
        if (stationType == 'receivingStation')
            return this.trainDetail?.timetableDaily?.receivingStation
                && this.trainDetail?.timetableYearly?.receivingStation?.name
                && this.trainDetail?.timetableDaily?.receivingStation?.name != this.trainDetail?.timetableYearly?.receivingStation?.name
                && this.trainDetail?.productType != 'SPECIAL_TRAIN';
        else
            return this.trainDetail?.timetableDaily?.sendingStation
                && this.trainDetail?.timetableYearly?.sendingStation?.name
                && this.trainDetail?.timetableDaily?.sendingStation?.name != this.trainDetail?.timetableYearly?.sendingStation?.name
                && this.trainDetail?.productType != 'SPECIAL_TRAIN';
    }
}
