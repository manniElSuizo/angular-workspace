import { inject, Injectable } from '@angular/core';
import { CommercialLocationSummary, Country, DangerousGoodLaw, LoadingPoint, Product, RailAuthority, RailOrderStatus } from '../models/general-order';
import { InternalApiUrls } from './internal-api-urls';
import { BehaviorSubject, catchError, Observable, of, Subject } from 'rxjs';
import { SessionStorageService } from '@src/app/shared/services/storage/session-storage.service';
import { StorageKeys } from '@src/app/shared/services/storage/storage.service.base';
import { CodeTablesService } from './code-tables.service';
import { RailOrderSearchSummary } from '@src/app/trainorder/models/ApiRailOrder.model';
import { BorderAndCommercialLocationSummary } from '../models/rail-order-api';
import { HttpParams } from '@angular/common/http';
import moment from 'moment';
import { TokInternalApiService } from '@src/app/trainorder/services/tok-internal-api.service';
import { CustomerData } from '@src/app/trainorder/models/authorization';
import { ErrorDialogService } from '@src/app/shared/error-handler/service/api-error-dialog.service';
import { StationType } from '@src/app/trainorder/models/location.models';
import { CommercialLocationSummary as CommercialLocationSummaryInternalApi } from '../models/om-internal-api';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';

enum LoadingEnum {
  NOT_STARTED,
  LOADING,
  LOADED
}

@Injectable({
  providedIn: 'root'
})
export class RailOrderInternalService extends CodeTablesService {

  public subjRailAuthorities: BehaviorSubject<RailAuthority[]> = new BehaviorSubject<RailAuthority[]>(null);

  private storageSubjectList: Map<string, BehaviorSubject<any>> = new Map();
  private sessionStorageService: SessionStorageService = inject(SessionStorageService);
  private tokInternalService = inject(TokInternalApiService);
  private errorDialogService: ErrorDialogService = inject(ErrorDialogService);

  private omBackendUrl;

  constructor() {
    super();
    this.omBackendUrl = this.env?.backendUrlOm;
  }

  private getFromSessionStorageOrHttp<T>(key: StorageKeys, httpCall: () => Observable<T>): Observable<T> {
    if (this.storageSubjectList.get(key)) {
      return this.storageSubjectList.get(key);
    }

    // if(storageResult) {
    //   subj.next(storageResult);
    //   return subj;
    // }

    this.storageSubjectList.set(key, new BehaviorSubject<T>(null));
    const httpResult = httpCall();
    httpResult.subscribe({
      next: (r: T) => {
        // this.sessionStorageService.setObject<T>(key, r);
        this.storageSubjectList.get(key).next(r);
      }
    });
    return this.storageSubjectList.get(key);
  }

  public getRailAuthorities(): Observable<RailAuthority[]> {
    const raList = JSON.parse(this.sessionStorageService.getItem(StorageKeys.MD_RAIL_AUTHORITIES_KEY));
    const railAuthorityComparator = (a: RailAuthority, b: RailAuthority) => a.uicCompanyCode - b.uicCompanyCode;
    // If authorities exist in session storage, return the sorted result
    if (raList) {
      return of(raList.sort(railAuthorityComparator));
    }

    // Fetch authorities if not in session storage
    const ra$ = this.fetchRailAuthorities();
    const subsc = ra$.subscribe({
      next: ras => {
        // Sort authorities before storing in session storage
        // const sortedRas = this.sortRailAuthoritiesByName(ras);
        const sortedRas = ras.sort(railAuthorityComparator)

        // Store sorted list in session storage
        this.sessionStorageService.setItem(StorageKeys.MD_RAIL_AUTHORITIES_KEY, JSON.stringify(sortedRas));

        // Emit sorted list
        this.subjRailAuthorities.next(sortedRas);

        subsc.unsubscribe();
        return sortedRas;
      }
    });

    // Return observable as is
    return ra$;
  }

  private sortRailAuthoritiesByName(raList: RailAuthority[]): RailAuthority[] {
    return raList.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
  }

  private fetchRailAuthorities(): Observable<RailAuthority[]> {
    return this.httpClient.get<RailAuthority[]>(this.backendUrl + InternalApiUrls.RAIL_AUTHORITIES);
  }

  public getRailOrdersCommercialLocations(query: string, stationType: StationType): Observable<CommercialLocationSummaryInternalApi[]> {
    let url = this.omBackendUrl + InternalApiUrls.RAIL_ORDERS_COMMERCIAL_LOCATIONS_URL;
    url += '?query=' + query + '&stationType=' + stationType;
    return this.httpClient.get<CommercialLocationSummaryInternalApi[]>(url);
  }

  public getCommercialLocations(query: string, uicCountryCode: number = null, uicRailAuthorityCode: number = null): Observable<CommercialLocationSummary[]> {
    if (!query) {
      throw "parameter query must not be null";
    }

    let url = this.backendUrl + InternalApiUrls.COMMERCIAL_LOCATION;
    const params = [];

    params.push(`query=${query}`);

    if (uicCountryCode != null) {
      params.push(`uicCountryCode=${uicCountryCode}`);
    }
    if (uicRailAuthorityCode != null) {
      params.push(`uicRailAuthorityCode=${uicRailAuthorityCode}`);
    }

    url += params.join('&');

    return this.httpClient.get<CommercialLocationSummary[]>(url);
  }

  public getCommercialAndBorderLocations(
    query: string,
    uicCountryCode: number | null = null
  ): Observable<BorderAndCommercialLocationSummary[]> {
    if (!query) {
      throw new Error("Parameter 'query' must not be null or empty.");
    }

    // Construct the URL and parameters
    const url = `${this.backendUrl}${InternalApiUrls.COMMERCIAL_AND_BORDER_LOCATIONS}`;
    const params: { [key: string]: string | number } = { query };

    if (uicCountryCode !== null) {
      params.uicCountryCode = uicCountryCode;
    }

    // Use HttpParams to handle query strings automatically
    const httpParams = new HttpParams({ fromObject: params });

    // Return the HTTP GET request
    return this.httpClient.get<BorderAndCommercialLocationSummary[]>(url, { params: httpParams });
  }

  /**
   * RID-Recht
   */
  public getDangerousGoodLaws(shippingDate: Date = null): Observable<DangerousGoodLaw[]> {
    let url = this.omBackendUrl + InternalApiUrls.DANGEROUS_GOOD_LAWS;
    if (shippingDate) {
      url = `${url}?shippingDate=${moment(shippingDate).format('yyyy-MM-DD')}`;
    }

    return this.httpClient.get<DangerousGoodLaw[]>(url);
  }

  public getCountries(): Observable<Country[]> {
    return this.getFromSessionStorageOrHttp(StorageKeys.MD_COUNTRY_KEY, () => this.httpClient.get<Country[]>(this.backendUrl + InternalApiUrls.COUNTRIES));
  }

  public getLoadingPoints(locationCode: string): Observable<LoadingPoint[]> {
    if (!locationCode || locationCode.trim() === '') {
      return of([]); // Return empty list as fallback
    }

    const url = this.backendUrl + InternalApiUrls.LOADING_POINTS.replace('{locationNumber}', encodeURIComponent(locationCode));

    return this.httpClient.get<LoadingPoint[]>(url).pipe(
      catchError(err => {
        console.error('Error fetching loading points:', err);
        return of([]); // Fallback to empty array on error
      })
    );
  }

  public getProducts(transportationType: string): Observable<Product[]> {
    if (!transportationType || transportationType.trim() === '') {
      return of([]); // Return empty array if input is invalid
    }

    const url = this.omBackendUrl + InternalApiUrls.PRODUCTS.replace('{transportationType}', encodeURIComponent(transportationType));

    return this.httpClient.get<Product[]>(url).pipe(
      catchError(err => {
        console.error('Error fetching products:', err);
        return of([]); // Graceful fallback on HTTP error
      })
    );
  }

  public isEditAllowed(railOrder: RailOrderSearchSummary): boolean {
    const allowedStates = [RailOrderStatus.SUBMITTED, RailOrderStatus.ACCEPTED, RailOrderStatus.WAITING, RailOrderStatus.EXPIRED]
    return allowedStates.includes(railOrder.railOrderStatus);
  }

  public getProfiles4Autocomplete() {
    const cds: Subject<CustomerData[]> = new Subject();
    this.tokInternalService.getProfiles().subscribe({
      next: custData => cds.next(custData),
      error: err => this.errorDialogService.openApiErrorDialog(err)
    });
  }

  public getRailOrdersCountryCodes(query: string, stationType: StationType): Observable<Country[]> {
    let url = this.omBackendUrl + ApiUrls.RAIL_ORDER_COUNTRYRIES;
    url += `?query=${query}&stationType=${stationType}`;
    return this.httpClient.get<Country[]>(url);
  }
}
