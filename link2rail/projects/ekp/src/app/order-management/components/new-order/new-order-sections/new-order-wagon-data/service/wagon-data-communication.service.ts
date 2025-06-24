import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WagonInformation } from '../../../../../models/rail-order-api';

export interface WagonDataCommunicationObject {
  wagonInformation: WagonInformation;
  componentName: string;
}

@Injectable({
  providedIn: 'root'
})
export class WagonDataCommunicationService {

  private wagonInfoChange: BehaviorSubject<WagonDataCommunicationObject> = new BehaviorSubject<WagonDataCommunicationObject>(null);
  public currentWagonInformation$: Observable<WagonDataCommunicationObject> = this.wagonInfoChange.asObservable();

  constructor() { }

  public changeWagonInformation(wagonInformation: WagonInformation, componentName: string) {
    this.wagonInfoChange.next({wagonInformation: wagonInformation, componentName: componentName});
  }
}
