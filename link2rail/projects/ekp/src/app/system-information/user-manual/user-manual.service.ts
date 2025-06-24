import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiUrls } from "@src/app/shared/enums/api-urls.enum";
import { UserManualResponse } from "../models/user-manual-response.model";
import { EnvService } from "@src/app/shared/services/env/env.service";

const OFFSET = 5;

@Injectable()
export class UserManualService {

  private backendUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.backendUrl = this.env.backendUrl;
  }

  uploadUserManual(file: File): Observable<any> {
    const formData = new FormData();
    formData.append("manual", file, file.name);
    return this.httpClient.post(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_MANUAL}`, formData);
  }

  fetchUserManualList(offset: number): Observable<UserManualResponse> {
    const limit = offset + OFFSET
    return this.httpClient.get<UserManualResponse>(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_MANUAL}/${offset}/${limit}`);
  }

  deleteManual(id: number): Observable<UserManualResponse> {
    return this.httpClient.delete<UserManualResponse>(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_MANUAL}/${id}`);
  }
}
