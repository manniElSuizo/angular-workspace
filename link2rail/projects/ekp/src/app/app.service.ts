import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CustomerProfile } from "./trainorder/models/authorization";
import * as moment from "moment";
import { Language } from "./shared/components/locale/locale.component";
import { LocalStorageService } from "./shared/services/local-storage/local-storage.service";

export enum ProgressState {
  LOADING = 'LOADING',
  VOID = 'VOID'
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public customerSelection: BehaviorSubject<CustomerProfile> = new BehaviorSubject<CustomerProfile>(null);
  private selectedLanguage: Language | undefined;
  
  inProgress: ProgressState;

  constructor(private storageService: LocalStorageService) {
    this.inProgress = ProgressState.VOID;
  }

  public getSelectedCustomerProfiles(): CustomerProfile[] | null {
    return this.storageService.getActiveSgvAndPartnerIdList();
  }

  public setProgressState(state: ProgressState) {
    this.inProgress = state;
  }

  public getProgressState(): ProgressState {
    return this.inProgress;
  }

  get language(): Language {
    return this.selectedLanguage;
  }

  set language(language: Language) {
    this.selectedLanguage = language;
  }
  
  /**
   * Convert a local Date string into ISO 8601 format
   * 
   * @param value Date string in Format 'YYYY-MM-DD' assumed to be local
   * @returns DateTime string in UTC in ISO 8601 format
   */
  public dateStringToUtcDateTimeString(value: string): string {
    if(!value) return null;
    return moment(value).toISOString();
}
}