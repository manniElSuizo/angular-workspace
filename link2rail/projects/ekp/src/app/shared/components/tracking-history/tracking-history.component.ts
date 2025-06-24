import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TrainIdentifier, TrainInfoData, TrainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';
import { InfrastructureLocation } from '@src/app/trainorder/models/location.models';
import { TrackingHistoryEntry, TrackingHistory, TrainTrackingHistoryResponse, EventGroup } from '@src/app/trainorder/models/ApiTrainsTrackingHistory.model';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { Observable } from 'rxjs';
import { TrainDetail, TrainChain } from '@src/app/trainorder/models/ApiTrainsDetail.model';
import { PermissionService } from '@src/app/shared/permission/PermissionService';
import { Authorization } from '@src/app/trainorder/models/authorization';
import { SharedModule } from '../../shared.module';
import { SortConditionsModel } from '@src/app/shared/models/sort.models';

enum ViewState {
    DAILY_SCHEDULE = 'DAILY_SCHEDULE',
    YEARLY_SCHEDULE = 'YEARLY_SCHEDULE'
}

interface TrackingHistoryEntryInternal extends TrackingHistoryEntry {
    trainNumber?: string;
}

interface RemarkObject {
        trainNumber: string
        dateTime: string
        remark: string
}

@Component({
    selector: 'app-tracking-history',
    templateUrl: './tracking-history.component.html',
    styleUrls: ['./tracking-history.component.scss'],
    standalone: true,
    imports: [
        SharedModule,
        MatDialogModule
    ]
})
export class TrackingHistoryComponent implements OnInit {

    protected sortConditions: SortConditionsModel = { asc: true, field: 'realTime' };
    protected viewState = ViewState.DAILY_SCHEDULE;
    protected schedule: TrackingHistoryEntryInternal[] = [];
    protected selectedTrain: TrainIdentifier;
    protected trackingHistory: TrackingHistory;
    protected chainTrackingHistoryResponse: TrainTrackingHistoryResponse;
    protected isTrainChain: boolean;
    protected fromToTrainChain: any;
    protected stationFrom: InfrastructureLocation;
    protected stationTo: InfrastructureLocation;
    protected trainChain: TrainChain | undefined;
    protected trainDetail: any
    protected remarkList: RemarkObject[] = new Array();
    protected has_permission_read_train_details = false;
    protected has_permission_read_tracking = false;


    constructor(@Inject(MAT_DIALOG_DATA) public data: { trackingHistoryTrainData: TrainInfoData }, private trainorderService: TrainorderService, private permissionService: PermissionService) { }

    ngOnInit(): void {
        this.determineTrainChain();
        const trainSummary = this.data.trackingHistoryTrainData;

        this.has_permission_read_tracking = this.data.trackingHistoryTrainData.authorization.includes(Authorization.READ_TRACKING);
        this.processTrackingHistory(trainSummary);

        this.has_permission_read_train_details = this.data.trackingHistoryTrainData.authorization.includes(Authorization.READ_TRAIN_DETAILS);
        if(this.has_permission_read_train_details) {
            this.getRemarkInformation();
        }
    }

    private processTrackingHistory(trainSummary: TrainInfoData) {
        if (this.has_permission_read_tracking) {
            if (this.isTrainChain) {
                this.loadTrackingHistoryTrainChain(trainSummary);
            } else {
                this.loadTrackingHistoryTrain(trainSummary);
            }
        }
    }

    protected sortTable() {
        this.sortConditions.asc = !this.sortConditions.asc;
        this.schedule.reverse()
    }

    protected selectTimetableDaily(): void {
        this.viewState = ViewState.DAILY_SCHEDULE;
        if (this.isTrainChain) {
            let tmpTrainNumber = '';
            this.schedule = [];
            this.chainTrackingHistoryResponse.forEach(r => r.timetableDaily.forEach(ttd => {
                const internalTtd: TrackingHistoryEntryInternal = { ...ttd };
                if (r.train.trainNumber != tmpTrainNumber) {
                    tmpTrainNumber = r.train.trainNumber;
                    internalTtd.trainNumber = r.train.trainNumber;
                }
                this.schedule.push(internalTtd);

            }));
            return;
        }
        if (!this.trackingHistory.timetableDaily) {
            return;
        }
        this.setStationsByTrackingHistory(this.trackingHistory.timetableDaily);
        this.schedule = [];
        for (const s of this.trackingHistory.timetableDaily) {
            this.schedule.push(s);
        }
    }

    protected selectTimetableYearly(): void {
        this.viewState = ViewState.YEARLY_SCHEDULE
        if (this.isTrainChain) {
            let tmpTrainNumber = '';
            this.schedule = [];
            this.chainTrackingHistoryResponse.forEach(r => r.timetableYearly.forEach(ttd => {
                const internalTtd: TrackingHistoryEntryInternal = { ...ttd };
                if (r.train.trainNumber != tmpTrainNumber) {
                    tmpTrainNumber = r.train.trainNumber;
                    internalTtd.trainNumber = r.train.trainNumber;
                }
                this.schedule.push(internalTtd);
            }));
            return;
        }
        if (!this.trackingHistory.timetableYearly) {
            return;
        }
        this.setStationsByTrackingHistory(this.trackingHistory.timetableYearly);
        this.schedule = [];
        for (const s of this.trackingHistory.timetableYearly) {
            this.schedule.push(s);
        }
    }

    protected determineTrainChain(): void {
        this.isTrainChain = false;
        if (this.data?.trackingHistoryTrainData?.trains?.length > 1) {
            this.isTrainChain = true;
        }
    }

    protected hasRemarks(): boolean {
        return this.remarkList.length > 0
    }

    protected toUpperOptionalString(s: string | undefined | null) {
        if (!s) return '';
        return s.toUpperCase();
    }

    protected getTrainIdentifier(trainSummary: TrainSummary, idx: number = 0): TrainIdentifier {
        return trainSummary.trains[idx];
    }

    protected getTrainNumbersAsCSV() {
        return this.chainTrackingHistoryResponse?.map(r => r.train.trainNumber).join(', ');
    }

    protected getTrainNumbersFromTrainDetailsAsCSV(){
        const fistTrainNumber = this.trainChain?.trains[0].train.trainNumber ;
        const lastTrainNumber = this.trainChain?.trains[this.trainChain.trains.length - 1].train.trainNumber;

        return `${fistTrainNumber}, ${lastTrainNumber}`
    }

    protected isPrePostEvent(event: TrackingHistoryEntryInternal): boolean {
        return event.eventGroup && (event.eventGroup == EventGroup.PRE_CARRIAGE || event.eventGroup == EventGroup.POST_TRANSPORT);
    }

    private loadTrackingHistoryTrainChain(trainSummary: TrainInfoData) {
        this.trainorderService.getTrainChainsTrackingHistory(trainSummary.trainChainIdentifier.trainChainId, trainSummary.trainChainIdentifier.trainChainDate).subscribe({
            next: (result: TrainTrackingHistoryResponse) => {
                if (result.length < 1) throw Error("no tracking history found");
                // this.trackingHistory = this.sortEvents(result[0]);
                this.trackingHistory = result[0];
                this.selectedTrain = result[0].train;
                this.chainTrackingHistoryResponse = result;
                this.stationFrom = result[0].sendingStation;
                this.stationTo = result[result.length - 1].receivingStation;
                this.fromToTrainChain = this.getFromToTrainChain();
                this.selectTimetableDaily();
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    private loadTrackingHistoryTrain(trainSummary: TrainInfoData) {
        this.selectedTrain = trainSummary.trains[0];
        this.trainorderService.getTrackingHistory(this.selectedTrain.trainNumber, this.selectedTrain.productionDate).subscribe({
            next: (result: TrackingHistory) => {
                // this.trackingHistory = this.sortEvents(result);
                this.trackingHistory = result;
                this.selectTimetableDaily();
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    private remarkText2remarkObject(trainId: string, remark: string): RemarkObject[] {
        const remarkObjects: RemarkObject[] = [];
        const lineArray = remark.split('\r\n');

        const currentRemarkObject: RemarkObject = {
            trainNumber: trainId,
            dateTime: '',
            remark: ''
        };

        // Regular expression to match the date and time format dd.mm.yyyy hh:mm:
        const dateTimeRegex = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:$/;

        for (const line of lineArray) {
            const trimmed_line = line.trim();
            if (trimmed_line === "") continue;

            if (dateTimeRegex.test(trimmed_line)) {
                // When a new dateTime is found, push the previous object if it has remarks
                if (currentRemarkObject.remark.length > 0) {
                    // push a copy of current remark object
                    remarkObjects.push({ ...currentRemarkObject });
                    // Reset remark for the new remark object
                    currentRemarkObject.remark = '';
                }
                currentRemarkObject.dateTime = this.removeTrailingColon(trimmed_line);
            } else {
                // Append remark text
                currentRemarkObject.remark += (currentRemarkObject.remark ? ' ' : '') + trimmed_line;
            }
        }

        // Push the last remarkObject if it has remarks
        if (currentRemarkObject.remark.length > 0) {
            remarkObjects.push(currentRemarkObject);
        }

        return remarkObjects;
    }
    // Usage: const dateString = "23.06.2024 14:30:";
    //const dateObject = parseDateString(dateString);
    //console.log(dateObject); // Output: Sun Jun 23 2024 14:30:00 GMT+0000 (Coordinated Universal Time)

    private parseDateString(dateString:string) {
        // Regular expression to match the date and time format dd.mm.yyyy hh:mm:
        const dateTimeRegex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):$/;
        const match = dateString.match(dateTimeRegex);

        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // Months are zero-based in JS
            const year = parseInt(match[3], 10);
            const hours = parseInt(match[4], 10);
            const minutes = parseInt(match[5], 10);

            // Construct and return the Date object
            return new Date(year, month, day, hours, minutes);
        }
        throw new Error("Invalid date format");
    }

    private removeTrailingColon(inputString : string) {
        return inputString.replace(/:$/, '');
    }

    private fillRemarkList() {
        if (this.trainChain) {
            this.trainChain.trains.forEach((train: TrainDetail) => {
                if (train.comment) {
                    this.remarkList= this.remarkText2remarkObject(train.train.trainNumber,train.comment);
                }
            });
            return;
        }

        if (this.trainDetail?.comment) {
            this.remarkList=this.remarkText2remarkObject( this.trainDetail.train.trainNumber,this.trainDetail.comment);
        }
        return;
    }

    private getTrainDetails(productionDate: Date, trainNumber: string): Observable<TrainDetail> {
        return this.trainorderService.getTrainInfo(trainNumber, productionDate);
    }

    private getTrainChainDetails(trainChainDate: Date, trainChainId: string): Observable<TrainChain> {
        return this.trainorderService.getTrainChainDetails(trainChainId, trainChainDate);
    }

    private sortEvents(result: TrackingHistory): TrackingHistory {
        result.timetableDaily.sort((e1, e2) => new Date(e1.scheduleDateTime).getTime() - new Date(e2.scheduleDateTime).getTime());
        result.timetableYearly.sort((e1, e2) => new Date(e1.scheduleDateTime).getTime() - new Date(e2.scheduleDateTime).getTime());
        return result;
    }

    private getRemarkInformation(): void {
        this.determineTrainChain();
        const trainSummary = this.data.trackingHistoryTrainData;
        if (this.isTrainChain) {
            this.getTrainChainDetails(trainSummary.trainChainIdentifier.trainChainDate, trainSummary.trainChainIdentifier.trainChainId).subscribe({
                next: (result: TrainChain) => {
                    this.trainChain = result;

                    this.fillRemarkList();
                },
                error: (err) => {
                    console.error(err);
                }
            });
        } else {
            this.selectedTrain = trainSummary.trains[0];
            this.getTrainDetails(this.selectedTrain.productionDate, this.selectedTrain.trainNumber).subscribe({
                next: (result: TrainDetail) => {
                    this.trainDetail = result;
                    this.fillRemarkList();
                },
                error: (err) => {
                    console.error(err);
                }
            });
        }
    }

    private getFromToTrainChain() {
        const fromHist = this.chainTrackingHistoryResponse[0];
        const toHist = this.chainTrackingHistoryResponse[this.chainTrackingHistoryResponse.length - 1];
        return `${fromHist.sendingStation.name} - ${toHist.receivingStation.name}`;
    }

    private setStationsByTrackingHistory(trackingHistoryEntries: TrackingHistoryEntry[]) {
        const tempArr = trackingHistoryEntries.filter(entry => entry.eventGroup != EventGroup.POST_TRANSPORT && entry.eventGroup != EventGroup.PRE_CARRIAGE);
        if (tempArr.length > 0) {
            this.stationFrom = tempArr[0].location;
            this.stationTo = tempArr[tempArr.length - 1].location;
        }
    }
}
