import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { CustomerData } from '../models/authorization';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';

export enum UseCase {
  CREATE_RAIL_ORDER = 'CREATE_RAIL_ORDER'
}

@Injectable({
  providedIn: 'root'
})
export class TokInternalApiService {
    protected httpClient: HttpClient = inject(HttpClient);
    protected env: EnvService = inject(EnvService);
    protected tokBackendUrl: string;

  constructor() {
    this.tokBackendUrl = this.env.backendUrl;
  }

  public getProfiles(): Observable<CustomerData[]> {
    return this.httpClient.get<CustomerData[]>(`${this.tokBackendUrl}${ApiUrls.PROFILES.replace('$useCase', UseCase.CREATE_RAIL_ORDER)}`);
  }

  public getSgvsWithSites(): Subject<SgvSites[]> {
    const sgvSites = new Subject<SgvSites[]>();
    this.getProfiles().subscribe({
      next: cds => {
        const elements: SgvSites[] = [];
        cds.forEach(cd => {
          let found = elements.find(e => e.sgvId == cd.sgvId);
          if(!found) {
            found = {sgvId: cd.sgvId, customerName: cd.customerName, sites: []};
            elements.push(found);
          }
          found.sites.push({partnerId: cd.partnerId, siteName: cd.siteName});
        });

        sgvSites.next(elements);
      }
    });
    return sgvSites;
  }

}

export interface SgvSites {
  sgvId: string;
  customerName: string;
  sites: {partnerId: string; siteName: string;}[];
}
