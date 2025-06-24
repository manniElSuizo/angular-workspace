import {TestBed} from '@angular/core/testing';
import {OrderFilterParametersService} from './order-filter-parameters.service';
import {CommercialLocation, DemandWagonType, IdNameType} from '../../api/generated';
import {TranslateService} from '@ngx-translate/core';
import {of, throwError} from 'rxjs';
import {OrderStatusViewEnum} from "../enums/order-status-view.enum";
import {
    ListKeyValue
} from "../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";
import {EmptyWagonOrderInternalService} from "../../api/generated/api/empty-wagon-order-internal.service";

describe('OrderFilterParametersService', () => {
    let service: OrderFilterParametersService;
    let spyEmptyWagonOrderInternalService;
    let spyTranslateService: jasmine.SpyObj<TranslateService>;

    beforeEach(() => {
        spyEmptyWagonOrderInternalService = jasmine.createSpyObj('EmptyWagonOrderInternalService', [
            'getDemandLocationsFromOrders',
            'getDemandWagonTypesFromOrders',
            'getOrdererSgvInformationFromOrders',
            'getOrdererPartnerInformationFromOrders',
            'getLoadRunCountries'
        ]);
        spyTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);

        TestBed.configureTestingModule({
            providers: [
                OrderFilterParametersService,
                {provide: EmptyWagonOrderInternalService, useValue: spyEmptyWagonOrderInternalService},
                {provide: TranslateService, useValue: spyTranslateService},
            ]
        });

        service = TestBed.inject(OrderFilterParametersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('findDemandLocations', () => {
        it('should return mapped demand locations (happy path)', (done) => {
            const commercialLocation: CommercialLocation = {
                number: '123',
                owner: 'owner1',
                name: 'Location1',
                countryCodeUic: '80'
            };
            const mockApiResponse: CommercialLocation[] = [commercialLocation];
            const expectedResult = [{key: '123_owner1_80', value: 'Location1 (123)'}];
            spyEmptyWagonOrderInternalService.getDemandLocationsFromOrders
                                             .and
                                             .returnValue(of(mockApiResponse));

            service.findDemandLocations('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            spyEmptyWagonOrderInternalService.getDemandLocationsFromOrders
                                             .and
                                             .returnValue(of([]));

            service.findDemandLocations('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            spyEmptyWagonOrderInternalService.getDemandLocationsFromOrders
                                             .and.returnValue(throwError(() => errorResponse));

            service.findDemandLocations('query').subscribe({
                next: () => fail('expected an error, not locations'),
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                    done();
                }
            });
        });
    });

    describe('findDemandWagonTypes', () => {
        it('should return mapped wagon types (happy path)', (done) => {
            const mockApiResponse: DemandWagonType[] = [{number: '456', name: 'WagonType1'}, {
                number: '456',
                name: 'WagonType1',
                code: '2180'
            }];
            const expectedResult = [{key: '456', value: 'WagonType1 (456)'}, {
                key: '456_2180',
                value: 'WagonType1 (456-2180)'
            }];
            spyEmptyWagonOrderInternalService.getDemandWagonTypesFromOrders
                                             .and.returnValue(of(mockApiResponse));

            service.findDemandWagonTypes('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            spyEmptyWagonOrderInternalService.getDemandWagonTypesFromOrders
                                             .and.returnValue(of([]));

            service.findDemandWagonTypes('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');

            spyEmptyWagonOrderInternalService.getDemandWagonTypesFromOrders
                                             .and.returnValue(throwError(() => errorResponse));

            service.findDemandWagonTypes('query').subscribe({
                next: () => fail('expected an error, not wagon types'),
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                    done();
                }
            });
        });
    });

    describe('findLoadRunCountries', () => {

        it('should return mapped load run countries (happy path)', (done: DoneFn) => {
            const mockApiResponse = [
                {id: 'AT', name: 'Country1'},
                {id: 'DE', name: 'Country2'}
            ];
            const expectedResult: ListKeyValue[] = [
                {key: 'AT', value: 'Country1'},
                {key: 'DE', value: 'Country2'}
            ];
            spyEmptyWagonOrderInternalService.getLoadRunCountries.and.returnValue(of(mockApiResponse));

            service.findLoadRunCountries("t").subscribe({
                next: result => {
                    expect(result).toEqual(expectedResult);
                    done();
                },
                error: done.fail
            });
        });

        it('should return an empty list when API returns an empty list', (done: DoneFn) => {
            spyEmptyWagonOrderInternalService.getLoadRunCountries.and.returnValue(of([]));

            service.findLoadRunCountries('b').subscribe({
                next: result => {
                    expect(result).toEqual([]);
                    done();
                },
                error: done.fail
            });
        });

        it('should return an empty list when an error occurs', (done: DoneFn) => {
            const errorResponse = new Error('API error');
            spyEmptyWagonOrderInternalService.getLoadRunCountries.and.returnValue(throwError(() => errorResponse));

            service.findLoadRunCountries('b').subscribe({
                next: result => {
                    expect(result).toEqual([]); // Expect an empty array when an error occurs
                    done();
                },
                error: done.fail
            });
        });
    });

    describe('findOrdererSgvs', () => {
        it('should return mapped orderer SGVs (happy path)', (done) => {
            const mockApiResponse: IdNameType[] = [{id: '789', name: 'SGV1'}];
            const expectedResult = [{key: '789', value: 'SGV1 (789)'}];
            spyEmptyWagonOrderInternalService.getOrdererSgvInformationFromOrders
                                             .and.returnValue(of(mockApiResponse));

            service.findOrdererSgvs('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            spyEmptyWagonOrderInternalService.getOrdererSgvInformationFromOrders
                                             .and.returnValue(of([]));

            service.findOrdererSgvs('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            spyEmptyWagonOrderInternalService.getOrdererSgvInformationFromOrders
                                             .and.returnValue(throwError(() => errorResponse));

            service.findOrdererSgvs('query').subscribe({
                next: () => fail('expected an error, not SGVs'),
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                    done();
                }
            });
        });
    });

    describe('getAllStatuses', () => {
        it('should return all statuses with translations', () => {
            const mockTranslations = {
                'ewd.shared.status.canceled': 'Canceled',
                'ewd.shared.status.created': 'Created',
                'ewd.shared.status.inProgress': 'In Progress',
                'ewd.shared.status.completed': 'Completed'
            };

            spyTranslateService.instant.and.callFake((key: string) => mockTranslations[key] || key);

            const result = service.getAllStatuses();
            expect(result.length).toBe(Object.keys(OrderStatusViewEnum).length);
            expect(result.find(status => status.key === OrderStatusViewEnum.Created)?.value).toBe('Created');
            expect(result.find(status => status.key === OrderStatusViewEnum.Canceled)?.value).toBe('Canceled');
        });
    });

    describe('getAllOrigins', () => {
        it('should return all origins', () => {
            const expectedResult = [
                {key: 'EWD', value: 'EWD'},
                {key: 'link2rail', value: 'link2rail'},

            ];

            const result = service.getAllOrigins();
            expect(result).toEqual(expectedResult);
        });
    });
});