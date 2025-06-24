import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {DemandWagonType} from "../../api/generated";
import {OrderStatusTranslations, OrderStatusViewEnum} from "../enums/order-status-view.enum";
import {TranslateService} from "@ngx-translate/core";
import {
    ListKeyValue
} from "../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import {EmptyWagonOrderInternalService} from "../../api/generated/api/empty-wagon-order-internal.service";

@Injectable({
    providedIn: "root",
})
export class OrderFilterParametersService {

    constructor(
        private translate: TranslateService,
        private apiService: EmptyWagonOrderInternalService,
    ) {

    }

    public getDataForSearchField(fieldName: string, query: string): Observable<ListKeyValue[]> {
        const retrievalMethod = this.dataSearchRetrievalMethods[fieldName];
        if (retrievalMethod) {
            return retrievalMethod(query).pipe(
                map(data => this.removeDuplicatesAndSort(data))
            );
        }
        console.warn(`No data retrieval method for field: ${fieldName}`);
        return of([]);

    }

    public getDataForSelectField(fieldName: string): ListKeyValue[] {
        const retrievalMethod = this.dataSelectRetrievalMethods[fieldName];
        if (retrievalMethod) return retrievalMethod();

        console.warn(`No data retrieval method for field: ${fieldName}`);
        return [];
    }

    public findDemandLocations(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getDemandLocationsFromOrders(query)
                   .pipe(map(items => items.map(item => ({
                       key: `${item.number}_${item.owner}_${item.countryCodeUic}`,
                       value: item.name ? `${item.name} (${item.number})` : item.number
                   }))));
    }

    public findDemandWagonTypes(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getDemandWagonTypesFromOrders(query)
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

    public findOrdererSgvs(query: string): Observable<ListKeyValue[]> {

        return this.apiService.getOrdererSgvInformationFromOrders(query)
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
        return this.apiService.getOrdererPartnerInformationFromOrders(query)
                   .pipe(map(source => source.map(item => ({key: item.id, value: `${item.name} (${item.id})`}))));
    }

    public getAllOrigins(): ListKeyValue[] {
        return this.removeDuplicatesAndSort(["link2rail", "EWD"].map(origin => ({key: origin, value: origin})));
    }

    public getAllStatuses(): ListKeyValue[] {
        return this.removeDuplicatesAndSort(
            Object.values(OrderStatusViewEnum).map(status => ({
                key: status,
                value: this.translate.instant(`ewd.shared.status.${OrderStatusTranslations[status]}`)
            }))
        )
    }

    public findLoadRunCountries(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getLoadRunCountries(query).pipe(
            map(source => source.map(item => ({key: item.id, value: item.name}))),
            catchError(error => {
                console.error('Error fetching load run countries:', error);
                return of([]);
            })
        );
    }

    private dataSearchRetrievalMethods: { [key: string]: (query: string) => Observable<ListKeyValue[]> } = {
        ordererSgv: (query) => this.findOrdererSgvs(query),
        ordererPartner: (query) => this.findOrdererPartners(query),
        demandLocation: (query) => this.findDemandLocations(query),

        demandWagonType: (query) => this.findDemandWagonTypes(query),
        loadRunCountry: (query) => this.findLoadRunCountries(query),
    };
    private dataSelectRetrievalMethods: { [key: string]: () => ListKeyValue[] } = {
        status: () => this.getAllStatuses(),
        origin: () => this.getAllOrigins()
    };

    private removeDuplicatesAndSort(data: ListKeyValue[]): ListKeyValue[] {
        const uniqueData = Array.from(new Map(data.map(item => [item.key, item])).values());
        return uniqueData.sort((a, b) => a.value.localeCompare(b.value));
    }

}