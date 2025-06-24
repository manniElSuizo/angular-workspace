import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role } from '../model/role.model';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { UserGroup, UserGroupData, UserGroupResponse, UserGroupSaveResponse } from '../model/usergroup.model';
import { CustomerProfile, CustomerProfileData, CustomerProfileSaveResponse } from '../model/profile.model';

export interface Error {
  code: string,
  message: string,
  affectedField: string
}

export interface UserGroupListRequest {
  profileId?: number,
  groupName?: string,
  offset?: number,
  limit?: number,
  sort?: string,
}

export interface RolesListResponse {
  roles: Role[],
  error: Error
}

export interface UserGroupListResponse {
  usergroups: UserGroup[],
  error: Error
}

export interface CustomerProfileListRequest {
  sgv?: string,
  completionStatus?: CompletionStatus,
  offset: number,
  limit: number,
  sort?: string,
}

export enum CompletionStatus {
  COMPLETE = 'COMPLETE',
  INCOMPLETE = 'INCOMPLETE',
  NOT_CREATED = 'NOT_CREATED',
  ALL = ''
}

export interface CustomerProfileListResponse {
  customerProfiles: CustomerProfile[],
  error: Error
}


@Injectable({
  providedIn: 'root'
})
export class UserGroupListService {

  private usermanagement_endpoint: string;

  private httpOptions = {
    headers: new HttpHeaders(
      {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    }
    )
  };

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.usermanagement_endpoint = this.env.backendUrlUserManagement;
  }

  searchUserGroup(body: UserGroupListRequest): Observable<UserGroupListResponse> {
    const url = this.usermanagement_endpoint + '/usergroup/search';
    return this.httpClient.post<UserGroupListResponse>(url, body);
  }

  createUserGroup(group: UserGroupData) {
    const url = this.usermanagement_endpoint + '/usergroup';
    return this.httpClient.post<UserGroupSaveResponse>(url, JSON.stringify(group), this.httpOptions);
  }

  createCustomerProfile(profile: CustomerProfileData) {
    const url = this.usermanagement_endpoint + '/customer-profile/' + profile.sgvId + '/' + profile.companyLocationNumber;
    return this.httpClient.put<CustomerProfileSaveResponse>(url, JSON.stringify(profile), this.httpOptions);
  }

  modifyUserGroup(group: UserGroupData): Observable<UserGroupSaveResponse> {
    return this.httpClient.put<UserGroupSaveResponse>(this.usermanagement_endpoint + '/usergroup/' + group.groupId, JSON.stringify(group), this.httpOptions);
  }

  fetchUserGroup(groupId: number): Observable<UserGroupResponse> {
      const url = this.usermanagement_endpoint + '/usergroup/' + groupId;
      return this.httpClient.get<UserGroupResponse>(url);
    }

  fetchRoles(isInternal?: Boolean): Observable<RolesListResponse> {
    const url = this.usermanagement_endpoint + '/roles' + (isInternal != undefined? '?isInternal=' + isInternal: '');
    return this.httpClient.get<RolesListResponse>(url);
  }

  fetchUserGroups(): Observable<UserGroupListResponse> {
    const url = this.usermanagement_endpoint + '/usergroups';
    return this.httpClient.get<UserGroupListResponse>(url);
  }

  deleteUserGroup(groupId: string): Observable<UserGroupSaveResponse> {
    const url = this.usermanagement_endpoint + '/usergroup/' + groupId;
    return this.httpClient.delete<UserGroupSaveResponse>(url);
  }

  requestAllCustomerProfiles(): Observable<CustomerProfileListResponse> {
    const url = this.usermanagement_endpoint + '/customers';
    return this.httpClient.get<CustomerProfileListResponse>(url);
  }

}
