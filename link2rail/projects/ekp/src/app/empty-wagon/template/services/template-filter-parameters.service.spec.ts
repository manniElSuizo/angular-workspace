/*
import {TestBed} from '@angular/core/testing';
import {TemplateFilterParametersService} from './template-filter-parameters.service';
import {CommercialLocation, DemandWagonType, IdNameType} from '../../api/generated';
import {
    ListKeyValue
} from '../../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import {of, throwError} from "rxjs";
import {
    EmptyWagonOrderInternalTemplateService
} from "../../api/generated/api/empty-wagon-order-internal-template.service";

describe('TemplateFilterParametersService', () => {
    let service: TemplateFilterParametersService;
    let apiServiceSpy;

    beforeEach(() => {
        apiServiceSpy = jasmine.createSpyObj('EmptyWagonOrderInternalTemplateService', [
            'getTemplateNamesFromTemplate',
            'getOrdererSgvInformationFromTemplates',
            'getOrdererPartnerInformationFromTemplates',
            'getShipperSgvInformationFromTemplates',
            'getShipperPartnerInformationFromTemplates',
            'getDemandLocationsFromTemplates',
            'getDemandWagonTypesFromTemplates',
            'getLoadRunCountriesFromTemplates',
        ]);

        TestBed.configureTestingModule({
            providers: [
                TemplateFilterParametersService,
                {provide: EmptyWagonOrderInternalTemplateService, useValue: apiServiceSpy}
            ]
        });

        service = TestBed.inject(TemplateFilterParametersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle no retrieval method for search field', (done: DoneFn) => {
        service.getDataForSearchField('unknownField', 'query').subscribe(data => {
            expect(data).toEqual([]);
            done();
        });
    });

    it('should remove duplicates and sort data', () => {
        const data: ListKeyValue[] = [
            {key: '1', value: 'B'},
            {key: '2', value: 'A'},
            {key: '1', value: 'B'}
        ];
        const result = service['removeDuplicatesAndSort'](data);
        expect(result).toEqual([{key: '2', value: 'A'}, {key: '1', value: 'B'}]);
    });

    describe('findTemplateNames', () => {
        it('should return mapped demand locations (happy path)', (done) => {
            const mockApiResponse: string[] = ['Template1'];
            const expectedResult = [{key: 'Template1', value: 'Template1'}];
            apiServiceSpy.getTemplateNamesFromTemplate
                         .and
                         .returnValue(of(mockApiResponse));

            service.findTemplateNames('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            apiServiceSpy.getTemplateNamesFromTemplate
                         .and
                         .returnValue(of([]));

            service.findTemplateNames('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            apiServiceSpy.getTemplateNamesFromTemplate
                         .and.returnValue(throwError(() => errorResponse));

            service.findTemplateNames('query').subscribe({
                next: () => fail('expected an error, not locations'),
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                    done();
                }
            });
        });
    });

    describe('findDemandLocations', () => {
        it('should return mapped demand locations (happy path)', (done) => {
            const commercialLocation: CommercialLocation = {
                number: '123',
                owner: 'owner1',
                name: 'Location1',
                countryCodeUic: '80'
            }
            const mockApiResponse: CommercialLocation[] = [commercialLocation];
            const expectedResult = [{key: '123_owner1_80', value: 'Location1'}];
            apiServiceSpy.getDemandLocationsFromTemplates
                         .and
                         .returnValue(of(mockApiResponse));

            service.findDemandLocations('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            apiServiceSpy.getDemandLocationsFromTemplates
                         .and
                         .returnValue(of([]));

            service.findDemandLocations('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            apiServiceSpy.getDemandLocationsFromTemplates
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
            apiServiceSpy.getDemandWagonTypesFromTemplates
                         .and.returnValue(of(mockApiResponse));

            service.findDemandWagonTypes('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            apiServiceSpy.getDemandWagonTypesFromTemplates
                         .and.returnValue(of([]));

            service.findDemandWagonTypes('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');

            apiServiceSpy.getDemandWagonTypesFromTemplates
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
            apiServiceSpy.getLoadRunCountriesFromTemplates.and.returnValue(of(mockApiResponse));

            service.findLoadRunCountries("t").subscribe({
                next: result => {
                    expect(result).toEqual(expectedResult);
                    done();
                },
                error: done.fail
            });
        });

        it('should return an empty list when API returns an empty list', (done: DoneFn) => {
            apiServiceSpy.getLoadRunCountriesFromTemplates.and.returnValue(of([]));

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
            apiServiceSpy.getLoadRunCountriesFromTemplates.and.returnValue(throwError(() => errorResponse));

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
            apiServiceSpy.getOrdererSgvInformationFromTemplates
                         .and.returnValue(of(mockApiResponse));

            service.findOrdererSgvs('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            apiServiceSpy.getOrdererSgvInformationFromTemplates
                         .and.returnValue(of([]));

            service.findOrdererSgvs('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            apiServiceSpy.getOrdererSgvInformationFromTemplates
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
    describe('findOrdererPartners', () => {
        it('should return mapped orderer partners (happy path)', (done) => {
            const mockApiResponse: IdNameType[] = [{id: '789', name: 'SGV1'}];
            const expectedResult = [{key: '789', value: 'SGV1 (789)'}];
            apiServiceSpy.getOrdererPartnerInformationFromTemplates
                         .and.returnValue(of(mockApiResponse));

            service.findOrdererPartners('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            apiServiceSpy.getOrdererPartnerInformationFromTemplates
                         .and.returnValue(of([]));

            service.findOrdererPartners('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            apiServiceSpy.getOrdererPartnerInformationFromTemplates
                         .and.returnValue(throwError(() => errorResponse));

            service.findOrdererPartners('query').subscribe({
                next: () => fail('expected an error, not partners'),
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                    done();
                }
            });
        });
    });

    describe('findShipperSgvs', () => {
        it('should return mapped shipper SGVs (happy path)', (done) => {
            const mockApiResponse: IdNameType[] = [{id: '789', name: 'SGV1'}];
            const expectedResult = [{key: '789', value: 'SGV1 (789)'}];
            apiServiceSpy.getShipperSgvInformationFromTemplates
                         .and.returnValue(of(mockApiResponse));

            service.findShipperSgvs('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            apiServiceSpy.getShipperSgvInformationFromTemplates
                         .and.returnValue(of([]));

            service.findShipperSgvs('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            apiServiceSpy.getShipperSgvInformationFromTemplates
                         .and.returnValue(throwError(() => errorResponse));

            service.findShipperSgvs('query').subscribe({
                next: () => fail('expected an error, not SGVs'),
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                    done();
                }
            });
        });
    });
    describe('findShipperPartners', () => {
        it('should return mapped shipper partners (happy path)', (done) => {
            const mockApiResponse: IdNameType[] = [{id: '789', name: 'SGV1'}];
            const expectedResult = [{key: '789', value: 'SGV1 (789)'}];
            apiServiceSpy.getShipperPartnerInformationFromTemplates
                         .and.returnValue(of(mockApiResponse));

            service.findShipperPartners('query').subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
        });

        it('should return an empty list when API returns an empty list', (done) => {
            apiServiceSpy.getShipperPartnerInformationFromTemplates
                         .and.returnValue(of([]));

            service.findShipperPartners('query').subscribe(result => {
                expect(result).toEqual([]);
                done();
            });
        });

        it('should handle API errors gracefully', (done) => {
            const errorResponse = new Error('API error');
            apiServiceSpy.getShipperPartnerInformationFromTemplates
                         .and.returnValue(throwError(() => errorResponse));

            service.findShipperPartners('query').subscribe({
                next: () => fail('expected an error, not partners'),
                error: (error) => {
                    expect(error).toEqual(errorResponse);
                    done();
                }
            });
        });
    });
});
*/