import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiUrls } from "@src/app/shared/enums/api-urls.enum";
import { ReleaseInformationResponse } from "../models/release-information-response.model";
import { EnvService } from "@src/app/shared/services/env/env.service";

const OFFSET = 5;

@Injectable()
export class ReleaseInformationService {

  private backendUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.backendUrl = this.env.backendUrl;
  }

  uploadReleaseInformation(file: File): Observable<any> {
    const formData = new FormData();
    formData.append("release", file, file.name);
    return this.httpClient.post(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_RELEASE}`, formData);
  }

  fetchReleaseInformationList(offset: number): Observable<ReleaseInformationResponse> {
    const limit = offset + OFFSET
    return this.httpClient.get<ReleaseInformationResponse>(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_RELEASE}/${offset}/${limit}`);
  }

  deleteReleaseInformation(id: number): Observable<ReleaseInformationResponse> {
    return this.httpClient.delete<ReleaseInformationResponse>(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_RELEASE}/${id}`);
  }
}
