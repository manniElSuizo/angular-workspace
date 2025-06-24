import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {
    ListKeyValue
} from "../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import {catchError, map} from "rxjs/operators";
import {DemandWagonType} from "../../api/generated";
import {
    EmptyWagonOrderInternalTemplateService
} from "../../api/generated/api/empty-wagon-order-internal-template.service";
import {ListKeyValueUtils} from "../../../shared/utils/list-key-value-utils";

@Injectable({
    providedIn: 'root'
})
export class TemplateFilterParametersService {

    constructor(
        private apiService: EmptyWagonOrderInternalTemplateService,
    ) { }

    public getDataForSearchField(fieldName: string, query: string): Observable<ListKeyValue[]> {
        const retrievalMethod = this.dataSearchRetrievalMethods[fieldName];
        console.log(`retrievalMethod: ${retrievalMethod} for fieldName: ${fieldName}`);
        if (retrievalMethod) {
            return retrievalMethod(query).pipe(
                map(data => ListKeyValueUtils.removeDuplicatesAndSort(data))
            );
        }
        console.warn(`No data retrieval method for field: ${fieldName}`);
        return of([]);
    }

    public findTemplateNames(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getTemplateNamesFromTemplate(query)
                   .pipe(
                       map(source => source.map(item => ({
                               key: item.id,
                               value: item.name ? `${item.name} (${item.id})` : item.id
                           }))
                       ),
                       map(data => ListKeyValueUtils.removeDuplicatesAndSort(data))
                   );
    }

    public findTemplateNamesForCreation(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getTemplateNamesFromTemplate(query, true)
                   .pipe(
                       map(
                           source => source.map(
                               item => (
                                   {key: item.id, value: item.name ? `${item.name} (${item.id})` : item.id})
                           )
                       ),
                       map(data => ListKeyValueUtils.removeDuplicatesAndSort(data))
                   );
    }

    public findOrdererSgvs(query: string): Observable<ListKeyValue[]> {

        return this.apiService.getOrdererSgvInformationFromTemplates(query)
                   .pipe(
                       map(source => source.map(
                           item => ({key: item.id, value: `${item.name} (${item.id})`}
                           ))),
                       catchError(error => {
                           console.error('Error fetching order sgvs:', error);
                           // Return an empty array or handle the error as needed
                           throw error;
                       })
                   );
    }

    public findOrdererPartners(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getOrdererPartnerInformationFromTemplates(query)
                   .pipe(map(source => source.map(item => ({key: item.id, value: `${item.name} (${item.id})`}))));
    }

    public findShipperSgvs(query: string): Observable<ListKeyValue[]> {

        return this.apiService.getShipperSgvInformationFromTemplates(query)
                   .pipe(
                       map(source => source.map(
                           item => ({key: item.id, value: `${item.name} (${item.id})`}
                           ))),
                       catchError(error => {
                           console.error('Error fetching order sgvs:', error);
                           // Return an empty array or handle the error as needed
                           throw error;
                       })
                   );
    }

    public findShipperPartners(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getShipperPartnerInformationFromTemplates(query)
                   .pipe(map(source => source.map(item => ({key: item.id, value: `${item.name} (${item.id})`}))));
    }

    public findDemandLocations(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getDemandLocationsFromTemplates(query)
                   .pipe(map(items => items.map(item => ({
                       key: `${item.number}_${item.owner}_${item.countryCodeUic}`,
                       value: item.name ? `${item.name} (${item.number})` : item.number
                   }))));
    }

    public findDemandWagonTypes(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getDemandWagonTypesFromTemplates(query)
                   .pipe(map(items => items.map(item => this.mapDemandWagonTypes(item)
                   )));
    }

    private mapDemandWagonTypes(item: DemandWagonType) {
        const {code, number, name = number} = item;
        return {
            key: code ? `${number}_${code}` : number,
            value: code ? `${name} (${number}-${code})` : `${name} (${number})`
        };
    }

    public findLoadRunCountries(query: string): Observable<ListKeyValue[]> {

        return this.apiService.getLoadRunCountriesFromTemplates(query).pipe(
            map(source => source.map(item => ({key: item.id, value: item.name}))),
            catchError(error => {
                console.error('Error fetching load run countries:', error);
                return of([]);
            })
        );
    }

    private dataSearchRetrievalMethods: { [key: string]: (query: string) => Observable<ListKeyValue[]> } = {
        templateName: (query) => this.findTemplateNames(query),
        ordererSgv: (query) => this.findOrdererSgvs(query),
        ordererPartner: (query) => this.findOrdererPartners(query),
        shipperSgv: (query) => this.findShipperSgvs(query),
        shipperPartner: (query) => this.findShipperPartners(query),
        demandLocation: (query) => this.findDemandLocations(query),
        demandWagonType: (query) => this.findDemandWagonTypes(query),
        loadRunCountry: (query) => this.findLoadRunCountries(query),
    };

}
