import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainChain, TrainDetail } from '@src/app/trainorder/models/ApiTrainsDetail.model';
import { BasicTrainInfoData, TrainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { ModalWindows } from '../../modal-windows/modal-windows';
import { TrainRemarksComponent } from '@src/app/trainorder/train-remarks/train-remarks.component';
import { TrainDetailsComponent } from '../train-details.component';

@Injectable({
  providedIn: 'root'
})
export class TrainDetailsService {
  constructor(private trainOrderService: TrainorderService, private modalWindows: ModalWindows) {

  }

  public trainDetails(trainSummary: BasicTrainInfoData) {
    let isTrainChain = this.isTrainChain(trainSummary);
    if (isTrainChain) {
      this.getTrainChainDetails(trainSummary.trainChainIdentifier.trainChainDate, trainSummary.trainChainIdentifier.trainChainId).subscribe(result => {
        let traindetail: TrainDetail | null = null;
        result.trains.forEach(train =>{
          if(train.train.productionDate === trainSummary.trains[0].productionDate && train.train.trainNumber === trainSummary.trains[0].trainNumber) {
            traindetail = train;
          }
        });
        this.modalWindows.openModalWindow(TrainDetailsComponent, {
          trainDetail: traindetail,
          trainChain: result
        }, 1040);
      });
    } else {
      this.getTrainDetails(trainSummary.trains[0].productionDate, trainSummary.trains[0].trainNumber).subscribe(result => {
        this.modalWindows.openModalWindow(TrainDetailsComponent, {
          trainDetail: result
        }, 1040)
      });
    }
  }

  public trainRemarks(trainSummary: TrainSummary) {
    let isTrainChain = this.isTrainChain(trainSummary);
    if (isTrainChain) {
      this.getTrainChainDetails(trainSummary.trainChainIdentifier.trainChainDate, trainSummary.trainChainIdentifier.trainChainId).subscribe(result => {
        this.modalWindows.openModalWindow(TrainRemarksComponent, {
          trainChain: result
        }, 1040)
      });
    } else {
      this.getTrainDetails(trainSummary.trains[0].productionDate, trainSummary.trains[0].trainNumber).subscribe(result => {
        this.modalWindows.openModalWindow(TrainRemarksComponent, {
          trainDetail: result
        }, 1040)
      });
    }
  }

  private getTrainDetails(productionDate: Date, trainNumber: string): Observable<TrainDetail> {
    return this.trainOrderService.getTrainInfo(trainNumber, productionDate);
  }

  private getTrainChainDetails(trainChainDate: Date, trainChainId: string): Observable<TrainChain> {
    return this.trainOrderService.getTrainChainDetails(trainChainId, trainChainDate);
  }

  private isTrainChain(trainSummary: BasicTrainInfoData): boolean {
    if (trainSummary.trains?.length > 1) {
      return true;
    }
    return false;
  }
}
