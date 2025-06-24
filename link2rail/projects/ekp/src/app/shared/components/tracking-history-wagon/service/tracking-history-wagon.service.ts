import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { WagonTrackingHistoryRequest, WagonTrackingHistory } from '../models/api-wagon-tracking-history.model';
import { ApiTrackingHistoryWagonMocks } from '../test/api-mocks';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';
import { EnvService } from '@src/app/shared/services/env/env.service';

@Injectable({
    providedIn: 'root'
})
export class TrackingHistoryWagonService {

    private backendUrl: string;

    private httpHeaders = {
        headers: new HttpHeaders({
            'Requested-By': 'TM-Web-Frontend'
        })
    }
    constructor(
        private httpClient: HttpClient,
        private env: EnvService
    ) {
        this.backendUrl = this.env?.backendUrlOm;
        if (!this.backendUrl) {
            console.info("No environment setting for backendUrl found!");
        }
    }

    public getWagonTrackingHistory(request: WagonTrackingHistoryRequest): Observable<WagonTrackingHistory[]> {
        if (!this.backendUrl) {
            console.warn('Backend URL is not configured. Using mock data.');
            return this.getMockWagonTrackingHistory(request);
        }
        const url = ApiUrls.RAILORDER_TRACKING_HISTORY.replace('{orderId}', `${request.orderId}`)
            .replace('{wagonNumber}', request.wagonNumber);
        const uri = this.backendUrl + url;
        return this.httpClient.get<WagonTrackingHistory[]>(uri, this.httpHeaders);
    }

    private getMockWagonTrackingHistory(request: WagonTrackingHistoryRequest): Observable<WagonTrackingHistory[]> {
        const mockResponse = new ApiTrackingHistoryWagonMocks().getStaticWagonSummaryResponse();
        return of(mockResponse).pipe(delay(2000));
    }
}
