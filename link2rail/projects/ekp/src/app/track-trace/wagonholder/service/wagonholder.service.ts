import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { vehicleMocks } from '../test/apiwagenholder.mock';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';
import { VehicleKeeperSummaryRequest, VehicleKeeperSummaryResponse } from '../models/ApiWagonholderList.models';

@Injectable({
  providedIn: 'root'
})
export class WagonholderService {

  constructor(private httpClient: HttpClient, private env: EnvService, private storageService: LocalStorageService) { }


  getWagonkeeperList(request: VehicleKeeperSummaryRequest): Observable<VehicleKeeperSummaryResponse> {
    /*let url = this.backendUrl + ApiUrls.TRAIN_DETAIL
    .replace('{train-number}', trainNumber)
    .replace('{prod-date}', productionDate)
    url =url + '?' + this.getActiveProfilesAsParam();
    const result = this.httpClient.get<TrainDetail>(url, this.httpHeaders);
    */
    console.log("request", request);
    const resp: VehicleKeeperSummaryResponse = {
      items: vehicleMocks.getVehicleKeeperSummaryForVehicleKeeperList(request.limit, request.offset),
      masterDataCodeTypes: [],
      offset: request.offset,
      limit: request.limit,
      total: request.offset + (2 * (request.offset + request.limit))
    };

    const obj: Subject<VehicleKeeperSummaryResponse> = new Subject();
    setTimeout(() => {
      obj.next(resp);
      console.log("response", resp);
    }, 2000);
    return obj;
  }




}
