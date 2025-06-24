import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Authorization, CustomerData, CustomerProfile } from '@src/app/trainorder/models/authorization';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private storage: Storage;
  private activeProfilesKey: string = "activeProfiles";
  private immediateAuthorizationsKey: string = "immediateAuthorizations";
  private customerAllAuthorizationsKey: string = "customerAllAuthorizations";
  private customerProfilesKey: string = "customerProfiles";
  private usernameKey: string = "username";

  private storageSubj = new Subject<any>();

  constructor() {
    this.storage = localStorage;
  }

  public clearStorage() {
    localStorage.clear();
    sessionStorage.clear();
  }

  clearAuthorizationStorage() {
    this.storage.removeItem(this.activeProfilesKey);
    this.storage.removeItem(this.immediateAuthorizationsKey);
    this.storage.removeItem(this.customerProfilesKey);
    this.storage.removeItem(this.usernameKey);
    this.removeCustomerAllAuthorizations();
    this.clearOAuthStorage();
    sessionStorage.removeItem("customUsername");
  }

  private clearOAuthStorage() {
    this.storage.removeItem("access_token");
    this.storage.removeItem("id_token");
    this.storage.removeItem("expires_at");
    this.storage.removeItem("refresh_token");
    this.storage.removeItem("scope");
    this.storage.removeItem("state");
    this.storage.removeItem("token_type");
  }

  public logAuthorizationStorage(): void {
    console.log('activeProfilesKey', this.storage.getItem(this.activeProfilesKey));
    console.log('immediateAuthorizationsKey', this.storage.getItem(this.immediateAuthorizationsKey));
    console.log('customerProfilesKey', this.storage.getItem(this.customerProfilesKey));
    console.log('usernameKey', this.storage.getItem(this.usernameKey));
  }

  removeActiveProfiles() {
    this.storage.removeItem(this.activeProfilesKey);
  }

  setImmediateAuthorizations(value: Authorization[], triggerLoaded: boolean = false) {
    this.storage.setItem(this.immediateAuthorizationsKey, JSON.stringify(value));
  }

  getImmediateAuthorizations(): Authorization[] | null {
    return this.toArray(this.storage.getItem(this.immediateAuthorizationsKey));
  }

  setCustomerAllAuthorizations(value: Authorization[]) {
    this.storage.setItem(this.customerAllAuthorizationsKey, JSON.stringify(value));
  }

  removeCustomerAllAuthorizations() {
    this.storage.removeItem(this.customerAllAuthorizationsKey);
  }

  getcustomerAllAuthorizations(): Authorization[] | null {
    return this.toArray(this.storage.getItem(this.customerAllAuthorizationsKey));
  }

  setCustomerProfiles(value: CustomerData[], triggerLoaded: boolean = false) {
    this.storage.setItem(this.customerProfilesKey, JSON.stringify(value));
  }

  getCustomerProfiles(): CustomerData[] | null {
    return this.toArray(this.storage.getItem(this.customerProfilesKey));
  }

  public storeActiveProfiles(activeProfiles: CustomerData[]) {
    this.storage.setItem(this.activeProfilesKey, JSON.stringify(activeProfiles));
  }

  getActiveProfiles(): CustomerData[] | null {
    return this.toArray(this.storage.getItem(this.activeProfilesKey));
  }

  getActiveSgvAndPartnerIdList(): CustomerProfile[] | null | undefined {
    if(this.getActiveProfiles() == null) return null;
    return this.getActiveProfiles()?.map( cd => {
      return {sgvId: cd.sgvId, partnerId: cd.partnerId};
    });
  }

  public setUsername(value: string) {
    this.storage.setItem(this.usernameKey, value);
  }

  getUsername() {
    return this.storage.getItem(this.usernameKey);
  }

  setLocalStorage(key: string, value: string) {
    this.storage.setItem(key, value);
    this.storageSubj.next(true);
  }

  getItem(key: string): string | null {
    if (this.storage.getItem(key))
      return this.storage.getItem(key);
    return null;
  }

  private toArray(str: string | null): [] | null {
    if(!str || str == null) return null;

    const jsonObj = JSON.parse(str);
    const obj: [] = Object.setPrototypeOf(jsonObj, []);
    return obj;
  }
}
