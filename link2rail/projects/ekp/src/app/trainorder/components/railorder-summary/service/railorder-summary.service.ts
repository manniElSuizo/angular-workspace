import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasicTrainInfoData } from '@src/app/trainorder/models/ApiTrainsList.models';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { RailorderSummaryComponent } from '../railorder-summary.component';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { RailorderSummary } from '@src/app/trainorder/models/ApiRailOrder.model';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';

@Injectable({
  providedIn: 'root'
})
export class RailorderSummaryService {
  constructor(private trainOrderService: TrainorderService, private modalWindows: ModalWindows, private localStorageService:LocalStorageService) {}
  public railOrderSummaryDetails(trainSummary: BasicTrainInfoData) {
    let getDetailsObservable: Observable<RailorderSummary[]>;

    if (this.isTrainChain(trainSummary)) {
      const { trainChainId, trainChainDate } = trainSummary.trainChainIdentifier;
      getDetailsObservable = this.getRailOrderDetailsListByTrainChain(trainChainId, trainChainDate, this.localStorageService.getActiveSgvAndPartnerIdList());
    } else {
      const { trainNumber, productionDate } = trainSummary.trains[0];
      getDetailsObservable = this.getRailOrderDetailsListByTrain(trainNumber, productionDate, this.localStorageService.getActiveSgvAndPartnerIdList());
    }

    getDetailsObservable.subscribe(result => {
      this.modalWindows.openModalWindow(RailorderSummaryComponent, {
        railorderSummaryList: result
      }, RailorderSummaryComponent.modalWidth);
    });
  }

  private getRailOrderDetailsListByTrain(trainNumber: string, prodDate: Date, customerProfiles?: CustomerProfile[]): Observable<RailorderSummary[]> {
    return this.trainOrderService.getRailOrderDetailsListByTrain(trainNumber, prodDate, customerProfiles);
  }

  private getRailOrderDetailsListByTrainChain(trainChainId: string, trainChainDate: Date, customerProfiles?: CustomerProfile[]): Observable<RailorderSummary[]> {
    return this.trainOrderService.getRailOrderDetailsListByTrainChain(trainChainId, trainChainDate, customerProfiles);
  }

  private isTrainChain(trainSummary: BasicTrainInfoData): boolean {
    const trainChainIdentifier = trainSummary.trainChainIdentifier;
    return trainChainIdentifier?.trainChainId != null && trainChainIdentifier.trainChainDate != null;
  }
}
