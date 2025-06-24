import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable, of, Subject } from 'rxjs';
import { map, take, timeout } from 'rxjs/operators';
import { CustomerResponse, MarketSegmentResponse, Site, SiteAddress, SiteResponse } from '@src/app/trainorder/models/ApiCustomers.model';
import { OrderRequest } from '@src/app/trainorder/models/ApiNewOrder.model';
import { ApiOrderReductionRequest, ApiOrdersListRequest, ApiOrdersListResponse, OrderDetails } from '@src/app/trainorder/models/ApiOrders.model';
import { Border, BorderResponse, CommercialServiceResponse, SupplierResponse, TomGroupsResponse, WorkingDirectionsResponse } from '@src/app/trainorder/models/ApiModels';
import { ApiTrainsListRequest, ApiTrainsListResponse, TrainChainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';
import { ApiDangerousGoodResponse, ApiGoodResponse, DangerousGoodsClassesResponse, WagonCodes } from '@src/app/trainorder/models/Cargo.model';
import { CustomerTrainNumberRequest, CustomerTrainNumberResponse } from '@src/app/trainorder/models/CustomerTrainNumber.model';
import { ApiHolidayResponse } from '@src/app/trainorder/models/Holiday.model';
import { CommercialLocation, CommercialLocationResponse, CommercialOrProductionLocationDisplay, InfrastructureLocation, InfrastructureLocationDisplay, InfrastructureLocationResponse, ProductionLocation, ProductionLocationResponse, StationType } from '@src/app/trainorder/models/location.models';
import { OrderTemplate, OrderTemplateModificationRequest, OrderTemplateRequest, OrderTemplateResponse, OrderTemplateSummaryRequest, OrderTemplateSummaryResponse } from '@src/app/trainorder/models/OrderTemplateModels';
import { ApiUrls } from '@src/app/shared/enums/api-urls.enum';
import { TrainChain, TrainDetail } from '@src/app/trainorder/models/ApiTrainsDetail.model';
import { TrainConnectionRequest, TrainConnectionResponse } from '@src/app/trainorder/models/ApiMonthViewResponse.model';
import { TrackingHistory, TrainTrackingHistoryResponse } from '@src/app/trainorder/models/ApiTrainsTrackingHistory.model';
import moment from 'moment';
import { trainListLimit } from '@src/app/shared/constants/Constants';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { RailorderSummary } from '@src/app/trainorder/models/ApiRailOrder.model';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class TrainorderService {

    public static filterCriteriaTrainsKey: string = 'filterCriteria';
    public static filterCriteriaOrdersKey: string = 'filterCriteriaOrders';
    public static filterCriteriaOrdertemplatesKey: string = 'filterCriteriaOrderTemplates';

    backendUrl: string;
    backendUrlOm : string;

    constructor(private httpClient: HttpClient, private env: EnvService, private storageService: LocalStorageService) {
        this.backendUrl = this.env?.backendUrl;
        this.backendUrlOm = this.env?.backendUrlOm;
        if (typeof this.backendUrl == 'undefined' || this.backendUrl == null) {
            console.info("no environment setting for backendUrl found!");
        }
    }

    getTrainNumbers(paramsBody: CustomerTrainNumberRequest): Observable<CustomerTrainNumberResponse> {
        return this.httpClient.post<CustomerTrainNumberResponse>(this.backendUrl + ApiUrls.TRAINS_TRAIN_NUMBER, this.addProfilesToRequest(paramsBody));
    }

    getProductionLocations(objKeyAlpha: string, objKeySeq: number, relationCode: string): Observable<ProductionLocationResponse> {
        const queryUrl = ApiUrls.PRODUCTION_LOCATIONS.replace('{objectKeyAlpha}', objKeyAlpha).replace('{objectKeySequence}', objKeySeq + '').replace('{relationCode}', relationCode);
        return this.httpClient.get<ProductionLocationResponse>(this.backendUrl + queryUrl)
            .pipe(
                take(1),
                map((result: ProductionLocationResponse) => {
                    return (result).map(station => {
                        return {
                            ...station,
                            name: station.name?.toUpperCase()
                        };
                    })
                }));
    }

    getOrdersCommercialLocations(query: string, stationType: StationType, arr: CommercialLocation[]): Observable<CommercialLocationResponse> {
        let url = ApiUrls.ORDERS_COMMERCIAL_LOCATIONS.replace('{query}', query).replace('{stationType}', stationType);
        if(this.getActiveProfilesValue('').length > 0) {
            url += '&' + this.getActiveProfilesAsParam();
        }

        if (query && query.length >= 3 && arr && !arr.find((elem: any) => elem.name === query)) {
            return this.httpClient.get<CommercialLocationResponse>(this.backendUrl + url)
                .pipe(
                    take(1),
                    map((result: CommercialLocationResponse) => {
                        return result.map(station => {
                            return {
                                ...station,
                                name: station.name?.toUpperCase()
                            };
                        });
                    }));
        } else {
            return of();
        }
    }

    getOrderTemplatesCommercialLocations(query: string, stationType: StationType, arr: CommercialLocation[]): Observable<CommercialLocationResponse> {
        let url = ApiUrls.ORDER_TEMPLATES_COMMERCIAL_LOCATIONS.replace('{query}', query).replace('{stationType}', stationType);
        if(this.getActiveProfilesValue('').length > 0) {
            url += '&' + this.getActiveProfilesAsParam();
        }

        if (query && query.length >= 3 && arr && !arr.find((elem: any) => elem.name === query)) {
            return this.httpClient.get<CommercialLocationResponse>(this.backendUrl + url)
                .pipe(
                    take(1),
                    map((result: CommercialLocationResponse) => {
                        return result.map(station => {
                            return {
                                ...station,
                                name: station.name?.toUpperCase()
                            };
                        });
                    }));
        } else {
            return of();
        }
    }

    getCommercialLocations(query: string, arr: CommercialLocation[]): Observable<CommercialLocationResponse> {
        let url = ApiUrls.COMMERCIAL_LOCATIONS.replace('{query}', query);

        if (query && query.length >= 3 && arr && !arr.find((elem: any) => elem.name === query)) {
            return this.httpClient.get<CommercialLocationResponse>(this.backendUrl + url)
                .pipe(
                    take(1),
                    map((result: CommercialLocationResponse) => {
                        return result.map(station => {
                            return {
                                ...station,
                                name: station.name?.toUpperCase()
                            };
                        });
                    }));
        } else {
            return of();
        }
    }

    public getRoundTripNames(sgvId: string, partnerId: string): Observable<TrainChainSummary[]> {
        let url = ApiUrls.TRAIN_CHAIN_IDS.toString() + '?profiles=' + sgvId + '-' + partnerId + '&trainChainType=ROUNDTRIP';
        console.log(url);
        return this.httpClient.get<TrainChainSummary[]>(this.backendUrl + url);
    }

    public getTrainsInfrastructureLocations(query: any, stationType: StationType, arr: InfrastructureLocation[]): Observable<InfrastructureLocation[]> {
        if (query && query.length >= 3 && arr && !arr.find((elem: any) => elem.name === query)) {
            let url = ApiUrls.TRAINS_INFRASTRUCTURE_LOCATIONS.replace('{query}', query).replace('{stationType}', stationType);
            if(this.getActiveProfilesValue('').length > 0) {
                url += '&' + this.getActiveProfilesAsParam();
            }
            return this.httpClient.get<InfrastructureLocationResponse>(this.backendUrl + url)
                .pipe(
                    take(1),
                    map((result: InfrastructureLocationResponse) => {
                        return result.map(station => {
                            return {
                                ...station,
                                name: station.name?.toUpperCase()
                            };
                        });
                    }));
        } else {
            return of();
        }
    }

    public getMonthViewInfrastructureLocations(query: any, stationType: StationType, arr: InfrastructureLocation[]): Observable<InfrastructureLocation[]> {
        if (query && query.length >= 3 && arr && !arr.find((elem: any) => elem.name === query)) {
            let url = ApiUrls.TRAINS_ORDERS_INFRASTRUCTURE_LOCATIONS.replace('{query}', query).replace('{stationType}', stationType);
            if(this.getActiveProfilesValue('').length > 0) {
                url += '&' + this.getActiveProfilesAsParam();
            }
            return this.httpClient.get<InfrastructureLocationResponse>(this.backendUrl + url)
                .pipe(
                    take(1),
                    map((result: InfrastructureLocationResponse) => {
                        return result.map(station => {
                            return {
                                ...station,
                                name: station.name?.toUpperCase()
                            };
                        });
                    }));
        } else {
            return of();
        }
    }

    public createUniqueKeysCommercialOrProductionLocations(locations: CommercialLocation[] | ProductionLocation []): CommercialLocation[] | ProductionLocation [] {
        if (locations) {
            const isd: CommercialOrProductionLocationDisplay[] = [];
            for (const location of locations) {
                const obj = isd.find(x => {
                    return x.name === location.name;
                });

                const ild: CommercialOrProductionLocationDisplay = {
                    ...location,
                    displayName: location.name
                }
                if (obj) {
                    if(obj.objectKeyAlpha?.toUpperCase() == ild.objectKeyAlpha?.toUpperCase() && obj.objectKeySequence == ild.objectKeySequence) {
                        continue;
                    }
                    obj.displayName =  obj.name + ' (' + obj.companyLocationNumberOwner + ')';
                    ild.displayName = ild.name + ' (' + ild.companyLocationNumberOwner + ')';
                }
                isd.push(ild);
            }
            locations = [];
            for (const i of isd) {
                const t: ProductionLocation | CommercialLocation = {
                    name: i.displayName.replace(/\s\s+/g, ' ').trim(),
                    objectKeyAlpha: i.objectKeyAlpha,
                    objectKeySequence: i.objectKeySequence,
                    companyLocationNumberOwner: i.companyLocationNumberOwner
                }
                const obj = locations.find(x => {
                    return x.name === t.name;
                });
                if(!obj){
                    locations.push(t);
                }
            }
        }
        return locations;
    }

    public createUniqueKeysInfrastructureLocations(locations: InfrastructureLocation[]): InfrastructureLocation[] {
        if (locations) {
            const isd: InfrastructureLocationDisplay[] = [];
            for (const location of locations) {
                const obj = isd.find(x => {
                    return x.name === location.name;
                });

                const ild: InfrastructureLocationDisplay = {
                    ...location,
                    displayName: location.name
                }
                if (obj) {
                    if(obj.objectKeyAlpha?.toUpperCase() == ild.objectKeyAlpha?.toUpperCase() && obj.objectKeySequence == ild.objectKeySequence) {
                        continue;
                    }
                    obj.displayName =  obj.name + ' (' + obj.objectKeySequence + ')';
                    ild.displayName = ild.name + ' (' + ild.objectKeySequence + ')';
                }
                isd.push(ild);
            }
            locations = [];
            for (const i of isd) {
                const t: InfrastructureLocation = {
                    name: i.displayName.replace(/\s\s+/g, ' ').trim(),
                    objectKeyAlpha: i.objectKeyAlpha,
                    objectKeySequence: i.objectKeySequence,
                    tafTsiPrimaryCode: i.tafTsiPrimaryCode,
                    country: i.country
                }
                const obj = locations.find(x => {
                    return x.name === t.name;
                });
                if(!obj){
                    locations.push(t);
                }
            }
        }
        return locations;
    }

    /**
     * Requests the list of cargo goods according to the input value
     * @param value nhm string code
     * @returns cargo goods promise
     */
    getCargoInfo(value: string, codeLength: number = null): Promise<ApiGoodResponse> {
        return new Promise((resolve, reject) => {
            let url = this.backendUrl + ApiUrls.GOODS + `?query=${value}`;
            if(codeLength) {
              url += '&codeLength=' + codeLength;
            }
            this.httpClient.get<ApiGoodResponse>(url)
                .pipe(take(1))
                .subscribe((result: ApiGoodResponse) => {
                resolve(result);
            });
            setTimeout(() => {
                reject(new Error("Data fetch failed after 5 sec."));
            }, 5000);
        })
    }

    getCargoCodes(value: string, codeLength: number = null): Promise<ApiGoodResponse> {
        return new Promise((resolve, reject) => {
            let url = this.backendUrl + ApiUrls.GOODS + `?codes=${value}`;
            if(codeLength) {
              url += '&codeLength=' + codeLength;
            }
            this.httpClient.get<ApiGoodResponse>(url)
                .pipe(take(1))
                .subscribe((result: ApiGoodResponse) => {
                resolve(result);
            });
            setTimeout(() => {
                reject(new Error("Data fetch failed after 5 sec."));
            }, 5000);
        })
    }

    getAllWagonTypes(): Observable<WagonCodes> {
        return this.httpClient.get<WagonCodes>(this.backendUrl + ApiUrls.WAGON_TYPES);
    }

    getWagonInfo(value: string): Promise<WagonCodes> {
        return new Promise((resolve, reject) => {
            this.httpClient.get<WagonCodes>(this.backendUrl + ApiUrls.WAGON_TYPES + `?query=${value}`)
                .pipe(take(1))
                .subscribe((result: WagonCodes) => {
                    //console.log(result)
                resolve(result);
            });
            setTimeout(() => {
                reject(new Error("Data fetch failed after 5 sec."));
            }, 5000);
        })
    }

    /**
     * Requests the list of dangerous cargo goods according to the input value
     * @param value un-code query string
     * @returns dangerous cargo goods promise
     */

    getDangerousCargoInfo(value: string, dateOfTheLaw?: string): Promise<ApiDangerousGoodResponse> {
        // Build the query string
        let query = this.backendUrl + ApiUrls.DANGEROUS_GOODS + `?query=${value}`;
        if (dateOfTheLaw) {
            query += `&dateOfTheLaw=${dateOfTheLaw}`;
        }

        const observable = this.httpClient.get<ApiDangerousGoodResponse>(query).pipe(
            timeout(5000) // Ensure the request times out after 5 seconds
        );

        // Use lastValueFrom to convert observable to a promise and apply timeout
        return lastValueFrom(observable)
            .then(result => {
                return result;
            })
            .catch(err => {
                // Reject if the timeout happens or any other error occurs
                return Promise.reject(new Error("Data fetch failed after 5 sec."));
            });
    }

    getDangerousCargo(uncode: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.backendUrl + ApiUrls.DANGEROUS_GOODS_UN_CODE + uncode)
                .pipe(take(1)).subscribe((result: any | any) => {
                    resolve(result);
                });
            setTimeout(() => {
                reject(new Error("Data fetch failed after 5 sec."))
            }, 5000);
        })
    }

    getDangerousGoodsClasses(): Observable<DangerousGoodsClassesResponse> {
        return this.httpClient.get<DangerousGoodsClassesResponse>(this.backendUrl + ApiUrls.DANGEROUS_GOODS_CLASSES).pipe(take(1));
    }

    /**
     * Send a post request with a new order object
     * @param body New order request object
     */
    sendNewOrderRequest(body: OrderRequest): Observable<any> {
        return this.httpClient.post(this.backendUrl + ApiUrls.NEW_ORDERS, body).pipe(take(1));
    }

    sendNewOrderTemplateRequest(body: OrderTemplateRequest): Observable<OrderTemplateResponse> {
        return this.httpClient.post<OrderTemplateResponse>(this.backendUrl + ApiUrls.ORDER_TEMPLATES, body).pipe(take(1));
    }

    sendTrainConnectionsSearchRequest(paramsBody: TrainConnectionRequest): Observable<TrainConnectionResponse> {
        return this.httpClient.post<TrainConnectionResponse>(this.backendUrl + ApiUrls.TRAIN_CONNECTIONS, paramsBody);
    }

    /**
     *  Sends a request with ApiTrainsListRequest conditions and retrieves a list of trains
     * @param paramsBody request conditions
     * @returns ApiTrainsListResponse
     */
    sendTrainsListRequest(paramsBody: ApiTrainsListRequest): Observable<ApiTrainsListResponse> {
        return this.httpClient.post<ApiTrainsListResponse>(this.backendUrl + ApiUrls.TRAINS, paramsBody);
    }

    /**
     * Sends a request to get the whole list of trains without any filtering
     * @returns ApiTrainsListResponse
     */
    sendCompleteTrainsListRequest(): Observable<ApiTrainsListResponse> {
        let paramsBody: ApiTrainsListRequest = {
            trainNumber: '',
            trainChainId: '',
            plannedDepartureFrom: undefined,
            plannedDepartureTo: undefined,
            sendingStationObjectKeyAlpha: undefined,
            sendingStationObjectKeySequence: undefined,
            receivingStationObjectKeyAlpha: undefined,
            receivingStationObjectKeySequence: undefined,
            customerProfiles: null,
            allTrainChains: false,
            offset: 0,
            limit: 10000,
            sort: '+number'
        }
        return this.httpClient.post<ApiTrainsListResponse>(this.backendUrl + ApiUrls.TRAINS, this.addProfilesToRequest(paramsBody));
    }

    /**
     *  Sends a request with ApiOrdersListRequest conditions to get the list of orders
     * @param paramsBody request conditions
     * @returns
     */
    sendOrdersListRequest(paramsBody: ApiOrdersListRequest): Observable<ApiOrdersListResponse> {
        return this.httpClient.post<ApiOrdersListResponse>(this.backendUrl + ApiUrls.ORDERS, this.addProfilesToRequest(paramsBody));
    }

    /*
    /**
     * Sends a request to get the whole list of trains without any filtering
     * @returns ApiTrainsListResponse
     */
    sendCompleteOrdersListRequest(): Observable<ApiOrdersListResponse> {
        let paramsBody = {
            templateId: null,
            templateName: null,
            sendingStationObjectKeyAlpha: null,
            sendingStationObjectKeySequence: null,
            receivingStationObjectKeyAlpha: null,
            receivingStationObjectKeySequence: null,
            customerProfiles: this.storageService.getActiveSgvAndPartnerIdList(),
            offset: 0,
            limit: trainListLimit,
            sort: '+shipmentDate'
        };
        return this.httpClient.post<ApiOrdersListResponse>(this.backendUrl + ApiUrls.ORDERS, paramsBody);
    }

    sendOrderDetailsRequest(orderNumber: string): Observable<OrderDetails> {
        return this.httpClient.get<OrderDetails>(this.backendUrl + ApiUrls.ORDER_DETAILS.replace('{order-number}', orderNumber) + '?' + this.getActiveProfilesAsParam());
    }

    postOrderCancelation(orderNumber: string, reason: string): Observable<any> {
        let body = {
            "cancelationReason": reason
        };
        // const error = new HttpErrorResponse({ status: 502 });
        // throwError(() => error);

        return this.httpClient.post<void>(this.backendUrl + ApiUrls.ORDER_CANCEL.replace('{order-number}', orderNumber), body);
    }

    postOrderCancellationByChain(trainChainId, trainChainDate, reason): Observable<any> {
        const body = {
            "cancelationReason": reason,
            "customerProfiles": this.storageService.getActiveSgvAndPartnerIdList()
        };
        // const error = new HttpErrorResponse({ status: 502 });
        // throwError(() => error);

        return this.httpClient.post<void>(
            this.backendUrl + ApiUrls.ORDER_CANCEL_BY_CHAIN
                .replace('{trainChainId}', trainChainId)
                .replace('{trainChainDate}', trainChainDate), body);
    }

    postOrderCancellationByTrain(trainNumber: string, productionDate: string, reason: string): Observable<any> {
        const body = {
            "cancelationReason": reason,
            "customerProfiles": this.storageService.getActiveSgvAndPartnerIdList()
        };

        // const error = new HttpErrorResponse({ status: 502 });
        // throwError(() => error);

        return this.httpClient.post<void>(
            this.backendUrl + ApiUrls.ORDER_CANCEL_BY_TRAIN
                .replace('{trainNumber}', trainNumber)
                .replace('{prodDate}', productionDate), body);
    }

    getOrderDetailsByTrain(trainNumber: string, productionDate: string): Observable<OrderDetails> {
        return this.httpClient.get<OrderDetails>(
            this.backendUrl + ApiUrls.ORDER_DETAILS_BY_TRAIN
                .replace('{train-number}', trainNumber)
                .replace('{prod-date}', productionDate)
                .replace('{active-profiles}', this.getActiveProfilesValue('')));
    }

    getOrderDetailsByChain(trainChainId: string, trainChainDate: string): Observable<OrderDetails> {
        return this.httpClient.get<OrderDetails>(
            this.backendUrl + ApiUrls.ORDER_DETAILS_BY_CHAIN
                .replace('{trainChainId}', trainChainId)
                .replace('{trainChainDate}', trainChainDate)
                .replace('{active-profiles}', this.getActiveProfilesValue('')));
    }

    postOrderReduce(orderNumber: string, body: ApiOrderReductionRequest): Observable<void> {
        return this.httpClient.post<void>(this.backendUrl +
            ApiUrls.ORDER_REDUCE.replace('{order-number}', orderNumber), body);
    }

    /**
     * Sends a request to get specific train details
     * @param train to get details of
     * @returns TrainsDetails
     */
    getTrainInfo(trainNumber: string, productionDate: Date): Observable<TrainDetail> {
        let url = this.backendUrl +
        ApiUrls.TRAIN_DETAIL
            .replace('{train-number}', trainNumber)
            .replace('{prod-date}', (moment(productionDate)).format('YYYY-MM-DD'));
            url =url + '?' + this.getActiveProfilesAsParam();

        const result = this.httpClient.get<TrainDetail>(url);
        return result;
    }
    getRailOrderDetailsListByTrainChain(trainChainId: string, trainChainDate: Date, customerProfiles: CustomerProfile[]): Observable<RailorderSummary[]> {
        console.log(`API-URL: ${ApiUrls.RAILORDER_DETAILS_BY_CHAIN}`)
        let uri = this.backendUrlOm + ApiUrls.RAILORDER_DETAILS_BY_CHAIN
            .replace('{trainChainId}', encodeURIComponent(trainChainId))
            .replace('{trainChainDate}', (moment(trainChainDate)).format('YYYY-MM-DD'))
            if(this.getActiveProfilesAsParam("profiles")) {
                uri =uri + '&' + this.getActiveProfilesAsParam("profiles");
            }
            return this.httpClient.get<RailorderSummary[]>(uri);
            //return of(mockRailorderSummaryList);
      }

    getRailOrderDetailsListByTrain(trainNumber: string, prodDate: Date,  customerProfiles?:CustomerProfile[]): Observable<RailorderSummary[]> {
        console.log(`API-URL: ${ApiUrls.RAILORDER_DETAILS_BY_TRAIN}`)
        let uri = this.backendUrlOm +
        ApiUrls.RAILORDER_DETAILS_BY_TRAIN
        //'/rail-orders?trainNumber={train-number}&prodDate={prod-date}'
            .replace('{train-number}', trainNumber)
            .replace('{prod-date}', (moment(prodDate)).format('YYYY-MM-DD'))

            if(this.getActiveProfilesAsParam("profiles")) {
                uri =uri + '&' + this.getActiveProfilesAsParam("profiles");
            }

        return this.httpClient.get<RailorderSummary[]>(uri);
        //return of(mockRailorderSummaryList);
    }


    getTrainChainDetails(trainChainId: string, trainChainDate: Date):Observable<TrainChain> {
        const uri = this.backendUrl + ApiUrls.TRAIN_CHAIN_DETAIL
            .replace('{trainChainId}', encodeURIComponent(trainChainId))
            .replace('{trainChainDate}', (moment(trainChainDate)).format('YYYY-MM-DD')) + '?' + this.getActiveProfilesAsParam("profiles");
        return this.httpClient.get<TrainChain>(uri);
    }

    getTrainInfoInOrders(trainNumber: any, productionDate: any): Observable<TrainDetail> {
        let url = this.backendUrl + ApiUrls.TRAIN_DETAIL
        .replace('{train-number}', trainNumber)
        .replace('{prod-date}', productionDate)
        url =url + '?' + this.getActiveProfilesAsParam();
        const result = this.httpClient.get<TrainDetail>(url);

        return result;
    }

    /**
     * Sends a request to get specific train tracking history
     * @param train to get tracking history
     * @returns ApiTrainsTrackingHistoryResponse
     */
    getTrackingHistory(trainNumber: string, productionDate: Date): Observable<TrackingHistory> {
        return this.httpClient.get<TrackingHistory>(this.backendUrl + ApiUrls.TRAINS_TRACKING_HISTORY
            .replace('{train-number}', trainNumber)
            .replace('{prod-date}', (moment(productionDate)).format('YYYY-MM-DD')));
    }

    getTrainChainsTrackingHistory(trainChainId: string, trainChainDate: Date): Observable<TrainTrackingHistoryResponse> {
        const uri = this.backendUrl + ApiUrls.TRAIN_CHAINS_TRACKING_HISTORY
            .replace('{trainChainId}', encodeURIComponent(trainChainId))
            .replace('{trainChainDate}', (moment(trainChainDate)).format('YYYY-MM-DD'));
        return this.httpClient.get<TrainTrackingHistoryResponse>(uri);
    }

    getCustomers(query: string): Observable<CustomerResponse> {
        return this.httpClient.get<CustomerResponse>(this.backendUrl + ApiUrls.CUSTOMERS + `?query=${query}`);
    }

    public getCustomersAddress(sgvNr: string, partnerId: string): Observable<SiteAddress> {
        return this.httpClient.get<SiteAddress>(this.backendUrl + ApiUrls.CUSTOMERS_ADDRESS.replace('{sgvNr}', sgvNr).replace('{partnerId}', partnerId));
    }

    getMarketSegments(): Observable<MarketSegmentResponse> {
        return this.httpClient.get<MarketSegmentResponse>(this.backendUrl + ApiUrls.MARKETSEGMENTS);
    }

    getBorders(query: string): Observable<BorderResponse> {
        return this.httpClient.get<BorderResponse>(this.backendUrl + ApiUrls.BORDERS + `?query=${query}`).pipe(
            take(1),
            map(result => {
                if(result) {
                    result = this.uniqByUicCode(result);
                }
                return result;
        }));
    }

    private uniqByUicCode(array: Border[]): Border[] {
        const map = new Map();
        for (const item of array) {
            map.set(item.uicBorderCode, item);
        }
        return Array.from(map.values());
    }

    public getSites4Sgv(sgvId: string): Observable<SiteResponse> {
        const result = this.httpClient.get<SiteResponse>(this.backendUrl + ApiUrls.CUSTOMERS_SITES.replace('{sgv-nr}', sgvId))
        .pipe(map(r => {
            const sites: Site[] = r.map(e => {e.partnerId = e.partnerId.trim(); return e;});
            return sites;
        })
        );
        return result;
    }

    public getPartner(sgv: string, partnerId: string): Subject<Site> {
        const site: Subject<Site> = new Subject();

        if (sgv && partnerId) {
            this.getSites4Sgv(sgv).subscribe(sr => {
                sr.forEach(s => {
                    if (s.partnerId == partnerId) {
                        site.next(s);
                    }
                })
            });
        }
        return site;
    }

    sendOrdertemplatesListRequest(paramsBody: OrderTemplateSummaryRequest): Observable<OrderTemplateSummaryResponse> {
        return this.httpClient.post<OrderTemplateSummaryResponse>(this.backendUrl + ApiUrls.ORDER_TEMPLATES_SEARCH, paramsBody);
    }

    /**
     * Saves order templates list filter conditions to the session storage
     */
    saveOrderTemplatesFilterDataToSessionStorage(requestConditions: OrderTemplateSummaryRequest): void {
        sessionStorage.setItem(TrainorderService.filterCriteriaOrdertemplatesKey, JSON.stringify(requestConditions));
    }

    /*
    * Deletes the selected order template
    */
    public deleteOrderTemplate(templateId: string): Observable<OrderTemplateSummaryResponse> {
        return this.httpClient.delete<OrderTemplateSummaryResponse>(this.backendUrl + ApiUrls.ORDER_TEMPLATES_TEMPLATE_ID.replace("{template-id}", templateId));
    }

    public putOrderTemplate(orderTemplate: OrderTemplate, templateId: string): Observable<OrderTemplateResponse> {
        const request: OrderTemplateModificationRequest = {
            orderTemplate: orderTemplate,
            templateId: templateId
        };
        return this.httpClient.put<OrderTemplateResponse>(this.backendUrl + ApiUrls.ORDER_TEMPLATES_TEMPLATE_ID.replace("{template-id}", templateId), request).pipe(take(1));
    }

    getOrderTemplatesFilterDataFromSessionStorage(): OrderTemplateSummaryRequest {
        const savedFilterCriteria = sessionStorage.getItem(TrainorderService.filterCriteriaOrdertemplatesKey);
        if (savedFilterCriteria) {
            const parsedData: OrderTemplateSummaryRequest = JSON.parse(savedFilterCriteria);
            return {...parsedData, limit: trainListLimit, offset: 0};
        }
        const obj = this.storageService.getActiveSgvAndPartnerIdList();
        let partnerId = '';
        let sgv = '';
        if(obj && obj.length) {
            partnerId = obj[0].partnerId;
            sgv = obj[0].sgvId;
        }
        return {
            customerProfiles: [{partnerId: partnerId, sgvId: sgv}],
            limit: trainListLimit,
            offset: 0,
            receiverName: '',
            senderName: '',
            sort: '',
            templateId: '',
            receivingStationObjectKeyAlpha: '',
            receivingStationObjectKeySequence: '',
            sendingStationObjectKeyAlpha: '',
            sendingStationObjectKeySequence: ''
        };
    }

    sendCompleteOrderTemplatesListRequest(): Observable<OrderTemplateSummaryResponse> {
        let paramsBody = {
            templateId: null,
            templateName: null,
            sendingStationObjectKeyAlpha: null,
            sendingStationObjectKeySequence: null,
            receivingStationObjectKeyAlpha: null,
            receivingStationObjectKeySequence: null,
            customerProfiles: null,
            offset: 0,
            limit: 10000,
            sort: '+number'
        }

        return this.httpClient.post<OrderTemplateSummaryResponse>(this.backendUrl + ApiUrls.ORDER_TEMPLATES_SEARCH, paramsBody);
    }

    getOrderTemplate(templateId: string): Observable<OrderTemplateResponse> {
        return this.httpClient.get<OrderTemplateResponse>(this.backendUrl + ApiUrls.ORDER_TEMPLATES_TEMPLATE_ID.replace("{template-id}", templateId));
    }

    /**
     * Sends a request to get holidays
     * @param dateFrom start date for holiday selection
     * @param dateUntil end date for holiday selection
     * @returns Observable<ApiHolidayResponse>
     */
    getHolidays(dateFrom: string | null, dateUntil: string | null): Observable<ApiHolidayResponse> {
        return this.httpClient.get<ApiHolidayResponse>(this.backendUrl + ApiUrls.HOLIDAYS + `?dateFrom=${dateFrom}&dateUntil=${dateUntil}`);
    }


    saveStationNameToSessionStorage(station: InfrastructureLocation, fieldName: string, formName: string) {
        sessionStorage.setItem(fieldName + formName, station.name);
    }

    getStationNameFromSessionStorage(fieldName: string, formName: string): string | null {
        return sessionStorage.getItem(fieldName + formName);
    }

    getNHMCodeDetails(nhmCodes: string[]): Observable<ApiGoodResponse> {
        // let newCodes = [...nhmCodes];
        // newCodes.push("27101991");
        // newCodes.push("01069000");
        // newCodes.push("03045600");
        // newCodes.push("02000000");
        // newCodes.push("99210000");
        // newCodes.push("87050000");
        // newCodes.push("03045620");
        // let codes = newCodes.join(',');
        // nhmCodes.sort();
        let codes = nhmCodes.join(',');
        return this.httpClient.get<ApiGoodResponse>(this.backendUrl + ApiUrls.GOODS + `?codes=${codes}`);
    }

    getSuppliers(): Observable<SupplierResponse> {
        return this.httpClient.get<SupplierResponse>(this.backendUrl + ApiUrls.SUPPLIERS);
        //return of(ApiMocks.supplierResponse());
    }

    getWorkingDirections(): Observable<WorkingDirectionsResponse> {
        return this.httpClient.get<WorkingDirectionsResponse>(this.backendUrl + ApiUrls.WORKING_DIRECTION);
    }

    getCommercialServices(): Observable<CommercialServiceResponse> {
        return this.httpClient.get<CommercialServiceResponse>(this.backendUrl + ApiUrls.COMMERCIAL_SERVICES);
    }

    getTomGroups(): Observable<TomGroupsResponse> {
        return this.httpClient.get<TomGroupsResponse>(this.backendUrl + ApiUrls.TOM_GROUPS);
    }

    private addProfilesToRequest(paramsBody: ApiOrdersListRequest | ApiTrainsListRequest | OrderTemplateSummaryRequest | CustomerTrainNumberRequest): ApiOrdersListRequest | ApiTrainsListRequest | OrderTemplateSummaryRequest | CustomerTrainNumberRequest {
        const obj = this.storageService.getActiveSgvAndPartnerIdList();
        if (obj != null) {
            return {...paramsBody, customerProfiles: obj};
        }
        return paramsBody;
    }
    private getActiveProfilesAsParam(paramName: string = 'profiles'):string {
        let url = '';
        if(this.storageService.getActiveProfiles()) {
            url = `${paramName}=`;
            url = this.getActiveProfilesValue(url);
        }
        return url;
    }

    private getActiveProfilesValue(url: string) {
        let isFirst = true;
        this.storageService.getActiveSgvAndPartnerIdList()?.forEach(ap => {
            if (!isFirst) {
                url = url + ',';
            }
            url = url + ap.sgvId + "-" + ap.partnerId;
            isFirst = false;
        });
        return url;
    }
}

