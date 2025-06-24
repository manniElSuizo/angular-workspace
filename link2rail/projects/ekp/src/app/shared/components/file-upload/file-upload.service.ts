import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderProgramUploadResponse } from '@src/app/trainorder/models/file-upload';
import { EnvService } from '../../services/env/env.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { ApiUrls } from '../../enums/api-urls.enum';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private backendUrl: string;

    constructor(private http: HttpClient, private env: EnvService, private storageService: LocalStorageService) {
        this. backendUrl = this.env.backendUrl;
    }

    uploadMonthWeekProgram(file: File): Observable<OrderProgramUploadResponse> {
        const profiles = this.storageService.getActiveProfiles();
        if (profiles != null) {
            const formData = new FormData();
            formData.append('profileSgv', profiles[0].sgvId);
            formData.append('profilePartner', profiles[0].partnerId);
            formData.append("program", file, file.name);

            return this.http.post(`${this.backendUrl}${ApiUrls.ORDERS_PROGRAM}`, formData);
        }
        throw "user is not logged in";
    }
}
