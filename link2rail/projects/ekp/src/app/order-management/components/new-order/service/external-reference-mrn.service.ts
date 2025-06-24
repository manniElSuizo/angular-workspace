import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export interface CodeNamePair {
    code: string;
    name: string;
    shortName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExternalReferenceMrnService {

    constructor(private translate: TranslateService) {}

    private data = [
        { code: '01', key: 'New-order.Mrn.01', shortName: 'Yes' },
        { code: '02', key: 'New-order.Mrn.02', shortName: 'Yes' }, 
        { code: '03', key: 'New-order.Mrn.03', shortName: 'No' },
        { code: '04', key: 'New-order.Mrn.04', shortName: 'No' },
        { code: '05', key: 'New-order.Mrn.05', shortName: 'No' },
        { code: '06', key: 'New-order.Mrn.06', shortName: 'No' },
        { code: '07', key: 'New-order.Mrn.07', shortName: 'No' },
        { code: '08', key: 'New-order.Mrn.08', shortName: 'No' },
        { code: '09', key: 'New-order.Mrn.09', shortName: 'No' }
       
    ];

    getAllMrnTypes(): Observable<CodeNamePair[]> {
        const translatedData = this.data.map(item => ({
            code: item.code,
            name: this.translate.instant(item.key), // Fetch translation dynamically
            shortName: item.shortName
        }));

        return of(translatedData);
    }
}