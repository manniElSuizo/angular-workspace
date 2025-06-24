import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { UserGroup } from '../model/usergroup.model';
import { CustomerGroup, CustomerGroupData, CustomerGroupResponse, CustomerGroupSaveResponse } from '../model/customergroup.model';

export interface Error {
  code: string,
  message: string,
  affectedField: string
}

export interface CustomerGroupListRequest {
  groupName?: string,
  offset?: number,
  limit?: number,
  sort?: string,
}

export interface UserGroupListResponse {
  usergroups: UserGroup[],
  error: Error
}

export interface CustomerGroupListResponse {
  groups: CustomerGroup[],
  error: Error
}

@Injectable({
  providedIn: 'root'
})
export class CustomerGroupListService {

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

  searchCustomerGroup(body: CustomerGroupListRequest): Observable<CustomerGroupListResponse> {
    const url = this.usermanagement_endpoint + '/customergroup/search';
    return this.httpClient.post<CustomerGroupListResponse>(url, body);
  }

  createCustomerGroup(group: CustomerGroupData) {
    const url = this.usermanagement_endpoint + '/customergroup';
    return this.httpClient.post<CustomerGroupSaveResponse>(url, JSON.stringify(group), this.httpOptions);
  }

  modifyCustomerGroup(group: CustomerGroupData): Observable<CustomerGroupSaveResponse> {
    return this.httpClient.put<CustomerGroupSaveResponse>(this.usermanagement_endpoint + '/customergroup/' + group.groupId, JSON.stringify(group), this.httpOptions);
  }

  fetchCustomerGroup(groupId: number): Observable<CustomerGroupResponse> {
      const url = this.usermanagement_endpoint + '/customergroup/' + groupId;
      return this.httpClient.get<CustomerGroupResponse>(url);
  }

  fetchCustomerGroups(): Observable<CustomerGroupListResponse> {
    const url = this.usermanagement_endpoint + '/customergroups';
    return this.httpClient.get<CustomerGroupListResponse>(url);
  }

  fetchUserGroups(): Observable<UserGroupListResponse> {
    const url = this.usermanagement_endpoint + '/usergroups';
    return this.httpClient.get<UserGroupListResponse>(url);
  }

  deleteCustomerGroup(groupId: string): Observable<CustomerGroupSaveResponse> {
    const url = this.usermanagement_endpoint + '/customergroup/' + groupId;
    return this.httpClient.delete<CustomerGroupSaveResponse>(url);
  }

}
