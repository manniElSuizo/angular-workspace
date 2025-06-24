import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CustomerProfile, CustomerProfileData, CustomerProfileDetails, CustomerProfileSave, CustomerRelationType, TomGroup } from '../model/profile.model';
import { EnvService } from '@src/app/shared/services/env/env.service';

export interface CustomerProfileListResponse {
  customerProfiles: CustomerProfile[],
  error: Error,
  limit?: number,
  offset?: number,
  total?: number,
}

export interface CustomerProfileResponse {
  profile: CustomerProfileDetails,
  errors: Error[]
}

export interface RelationTypeListResponse {
  relationTypes: CustomerRelationType[],
  errors: Error[]
}


export interface CustomerProfileListRequest {
  sgv?: string,
  completionStatus?: CompletionStatus,
  offset: number,
  limit: number,
  sort?: string,
}

export interface TomGroupListResponse {
  tomgroups: TomGroup[];
  errors: Error[];
}

export interface CustomerProfileSaveResponse {
  success: boolean,
  errors: Error[],
}

export interface CustomerProfilesSaveRequest {
  profiles: CustomerProfileSave[],
}

export enum CompletionStatus {
  COMPLETE = 'COMPLETE',
  INCOMPLETE = 'INCOMPLETE',
  CREATED = "CREATED",
  NOT_CREATED = 'NOT_CREATED',
  ALL = ''
}

@Injectable({
  providedIn: 'root'
})
export class ProfileListService {

  private usermanagement_endpoint: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.usermanagement_endpoint = this.env.backendUrlUserManagement;
  }

  requestAllCustomerProfiles(): Observable<CustomerProfileListResponse> {
    const url = this.usermanagement_endpoint + '/customers';
    return this.httpClient.get<CustomerProfileListResponse>(url);
  }

  requestCustomerProfileList(req: CustomerProfileListRequest): Observable<CustomerProfileListResponse> {
    const url = this.usermanagement_endpoint + '/customer/search';
    return this.httpClient.post<CustomerProfileListResponse>(url, req);
  }

  changeCustomerProfileList(req: CustomerProfilesSaveRequest): Observable<CustomerProfileSaveResponse> {
    const url = this.usermanagement_endpoint + '/customer';
    return this.httpClient.put<CustomerProfileSaveResponse>(url, req);
  }

  getTomGroups(): Observable<TomGroupListResponse> {
    const url = this.usermanagement_endpoint + '/tomgroups';
    return this.httpClient.get<TomGroupListResponse>(url);
  }

  fetchCustomerProfile(sgvId: string, companyLocationNumber: string): Observable<CustomerProfileResponse> {
    const url = this.usermanagement_endpoint + '/customer-profile/' + sgvId + '/' + companyLocationNumber;
    return this.httpClient.get<CustomerProfileResponse>(url);
  }

  modifyCustomerProfile(profile: CustomerProfileData): Observable<CustomerProfileSaveResponse> {
    const url = this.usermanagement_endpoint + '/customer-profile/' + profile.sgvId + '/' + profile.companyLocationNumber;
    return this.httpClient.put<CustomerProfileSaveResponse>(url, profile);
  }

  getRelationTypes(): Observable<RelationTypeListResponse> {
    const url = this.usermanagement_endpoint + '/relation-types';
    return this.httpClient.get<RelationTypeListResponse>(url);
  }

}
