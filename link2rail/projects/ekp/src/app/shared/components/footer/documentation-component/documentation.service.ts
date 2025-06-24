import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiUrls } from "@src/app/shared/enums/api-urls.enum";
import { EnvService } from "@src/app/shared/services/env/env.service";
import { ReleaseInformationResponse } from "@src/app/system-information/models/release-information-response.model";
import { UserManualResponse } from "@src/app/system-information/models/user-manual-response.model";


@Injectable()
export class DocumentationService {

  private backendUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.backendUrl = this.env.backendUrl;
  }

  fetchLatestUserManual(): Observable<UserManualResponse> {
    return this.httpClient.get<UserManualResponse>(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_MANUAL}`);
  }

  fetchLatestReleaseNotes(): Observable<ReleaseInformationResponse> {
    return this.httpClient.get<ReleaseInformationResponse>(`${this.backendUrl}${ApiUrls.SYSTEMINFORMATION_RELEASE}`);
  }
}
