import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {InvoiceFilterParameterService} from './invoice-filter-parameter.service';
import {InvoiceInternalAPIService} from '../api/generated/api/invoice-internal-api.service';
import {ListKeyValueUtils} from '../../shared/utils/list-key-value-utils';
import {
    ListKeyValue
} from '../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';

describe('InvoiceFilterParameterService', () => {
    let service: InvoiceFilterParameterService;
    let apiServiceSpy: jasmine.SpyObj<InvoiceInternalAPIService>;

    const fakeDebitorsResponse = [
        {id: '2', name: 'B Company'},
        {id: '1', name: 'A Company'},
        {id: '2', name: 'B Company'} // duplicate to test deduplication
    ];

    beforeEach(() => {
        const spy = jasmine.createSpyObj('InvoiceInternalAPIService', ['getInvoiceDebitors']);

        TestBed.configureTestingModule({
            providers: [
                InvoiceFilterParameterService,
                {provide: InvoiceInternalAPIService, useValue: spy}
            ]
        });
        service = TestBed.inject(InvoiceFilterParameterService);
        apiServiceSpy = TestBed.inject(InvoiceInternalAPIService) as jasmine.SpyObj<InvoiceInternalAPIService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should find and transform invoice debitors correctly', (done: DoneFn) => {
        // Arrange: Force the fake response to any to surpass type mismatch (Observable<HttpEvent<...>>).
        apiServiceSpy.getInvoiceDebitors.and.returnValue(of(fakeDebitorsResponse) as any);

        // Act
        service.findInvoiceDebitors('test query').subscribe({
            next: (result: ListKeyValue[]) => {
                // Transform: Each debitor becomes { key: debitor.id, value: `${debitor.name} (${debitor.id})` }.
                // Then duplicates are removed and sorted by value.
                const expected: ListKeyValue[] = ListKeyValueUtils.removeDuplicatesAndSort([
                    {key: '2', value: 'B Company (2)'},
                    {key: '1', value: 'A Company (1)'}
                ]);
                expect(result).toEqual(expected);
                done();
            },
            error: done.fail
        });
    });

    it('should propagate error when the API service fails', (done: DoneFn) => {
        const errorResponse = new Error('API failure');
        // Use throwError to simulate an API error.
        apiServiceSpy.getInvoiceDebitors.and.returnValue(throwError(() => errorResponse) as any);

        service.findInvoiceDebitors('test query').subscribe({
            next: () => {
                done.fail('Expected error to be thrown');
            },
            error: error => {
                expect(error).toBe(errorResponse);
                done();
            }
        });
    });
});
