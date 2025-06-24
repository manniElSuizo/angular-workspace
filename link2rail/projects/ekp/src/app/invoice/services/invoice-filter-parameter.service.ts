import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
    ListKeyValue
} from '../../shared/components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
import {InvoiceInternalAPIService} from "../api/generated/api/invoice-internal-api.service";
import {ListKeyValueUtils} from "../../shared/utils/list-key-value-utils";

@Injectable({
    providedIn: 'root'
})
export class InvoiceFilterParameterService {

    constructor(private apiService: InvoiceInternalAPIService) {}

    /**
     * Retrieves a list of invoice debitors based on the provided query.
     * It uses the apiService to get the data and maps the result to a ListKeyValue array.
     *
     * @param query The query string used to search for debitors.
     * @returns An Observable that emits an array of ListKeyValue objects.
     */
    public findInvoiceDebitors(query: string): Observable<ListKeyValue[]> {
        return this.apiService.getInvoiceDebitors(query).pipe(
            map((debitors: Array<{ id: string; name: string }>) =>
                debitors.map(debitor => ({
                    key: debitor.id,
                    value: debitor.id ? `${debitor.name} (${debitor.id})` : debitor.name,
                }))
            ),
            map(data => ListKeyValueUtils.removeDuplicatesAndSort(data))
        );
    }
}
