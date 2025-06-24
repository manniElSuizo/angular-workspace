import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EnvService } from '@src/app/shared/services/env/env.service';


export interface AuthorizationMatrix {
  appModules: AuthorizationAppModule[],
  authorizations: AuthorizationInfo[]
}

export interface AuthorizationAppModule {
  appModule: string,
  authorizationRoles: string[]
}

export interface AuthorizationInfo {
  authorization: string,
  module: string,
  grantedRoles: AuthorizationGrantedRole[]
}

export interface AuthorizationGrantedRole {
  authorizationRole: string,
  module: string,
  customerRoles: string[]
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationMatrixService {

  private usermanagement_endpoint: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.usermanagement_endpoint = this.env.backendUrlUserManagement;
  }

  requestMatix(): Observable<AuthorizationMatrix> {
    const url = this.usermanagement_endpoint + '/authorization-matrix';
    return this.httpClient.get<AuthorizationMatrix>(url);
  }

}
