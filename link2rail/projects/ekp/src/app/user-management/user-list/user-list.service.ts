import { Injectable } from '@angular/core';
import { User, UserAuthorizationMatrix, UserData, UserResponse, UserSaveResponse } from '../model/user.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role } from '../model/role.model';
import { CustomerProfile, CustomerProfileResponse } from '../model/profile.model';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { WagonKeeperResponse } from '../model/wagon-keeper.model';
import { CustomerGroup } from '../model/customergroup.model';
import { AccountsReceivableNumberResponse } from '../model/accountsreveivablenumber.model';
import { UserGroup } from '../model/usergroup.model';

export interface Error {
  code: string,
  message: string,
  affectedField: string
}
export interface UserListResponse {
  users: User[],
  success: boolean,
  errors: Error[],
  limit: number,
  offset: number,
  total: number,
}

export interface UserListRequest {
  type?: TMUserType,
  userName?: string,
  offset?: number,
  limit?: number,
  sort?: string,
  customerProfileId?: number
}

export enum TMUserType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  ALL = ''
}

export interface RolesListResponse {
  roles: Role[],
  error: Error
}

export interface CustomerGroupListResponse {
  groups: CustomerGroup[],
  error: Error
}

export interface UserGroupListResponse {
  usergroups: UserGroup[],
  error: Error
}

export interface CustomerProfileListResponse {
  customerProfiles: CustomerProfile[],
  error: Error
}

@Injectable({
  providedIn: 'root'
})
export class UserListService {

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

  requestAccUserList(body: UserListRequest): Observable<UserListResponse> {
    const url = this.usermanagement_endpoint + '/user/search';
    return this.httpClient.post<UserListResponse>(url, body);
  }

  fetchUser(userId: number): Observable<UserResponse> {
    const url = this.usermanagement_endpoint + '/user/' + userId;
    return this.httpClient.get<UserResponse>(url);
  }

  createlUser(user: UserData) {
    const url = this.usermanagement_endpoint + '/user';
    return this.httpClient.post<UserSaveResponse>(url, JSON.stringify(user), this.httpOptions);
  }

  modifyUser(user: UserData): Observable<UserSaveResponse> {
    return this.httpClient.put<UserSaveResponse>(this.usermanagement_endpoint + '/user/' + user.userId, JSON.stringify(user), this.httpOptions);
  }


  fetchRoles(isInternal?: Boolean): Observable<RolesListResponse> {
    const url = this.usermanagement_endpoint + '/roles' + (isInternal != undefined? '?isInternal=' + isInternal: '');
    return this.httpClient.get<RolesListResponse>(url);
  }

  fetchCustomerGroups(): Observable<CustomerGroupListResponse> {
    const url = this.usermanagement_endpoint + '/customergroups';
    return this.httpClient.get<CustomerGroupListResponse>(url);
  }

  fetchUserGroups(): Observable<UserGroupListResponse> {
    const url = this.usermanagement_endpoint + '/usergroups';
    return this.httpClient.get<UserGroupListResponse>(url);
  }

  fetchSgvId(macId: string): Observable<CustomerProfileResponse> {
    const url = this.usermanagement_endpoint + '/customer-profile/' + macId;
    return this.httpClient.get<CustomerProfileResponse>(url);
  }

  deleteUser(userId: string): Observable<UserSaveResponse> {
    const url = this.usermanagement_endpoint + '/user/' + userId;
    return this.httpClient.delete<UserSaveResponse>(url);
  }

  public getUserAuthorizations(userId: string): Observable<UserAuthorizationMatrix> {
    const url = this.usermanagement_endpoint + '/user-authorization-matrix/' + userId;
    return this.httpClient.get<UserAuthorizationMatrix>(url);
  }

  public wagonKeepersGet(query: string) {
    if(!query) {
      throw 'query must not be null';
    }

    const url = this.usermanagement_endpoint + '/wagon-keepers?query=' + query;
    return this.httpClient.get<WagonKeeperResponse>(url);
  }

  public accountsReceivableNumbersGet(query: string) {
    if(!query) {
      throw 'query must not be null';
    }

    const url = this.usermanagement_endpoint + '/accounts-receivable-numbers?query=' + query;
    return this.httpClient.get<AccountsReceivableNumberResponse>(url);
  }

  requestAllCustomerProfiles(): Observable<CustomerProfileListResponse> {
    const url = this.usermanagement_endpoint + '/customers';
    return this.httpClient.get<CustomerProfileListResponse>(url);
  }
}
