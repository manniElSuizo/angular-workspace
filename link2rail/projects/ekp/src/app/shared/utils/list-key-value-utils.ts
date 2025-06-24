import {ListKeyValue} from "../components/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component";

/**
 * Utility class providing helper methods for processing arrays of ListKeyValue objects.
 */
export class ListKeyValueUtils {
    /**
     * Removes duplicate entries from an array of ListKeyValue objects and sorts the resulting array by the value
     * property.
     *
     * Duplicates are determined by the "key" property; if duplicates exist, the last occurrence in the array is
     * retained. The sorting is performed in ascending alphabetical order based on the "value" property. If a value is
     * null or undefined, it is treated as an empty string for sorting purposes.
     *
     * @param {ListKeyValue[]} data - The array of ListKeyValue objects to process.
     * @returns {ListKeyValue[]} A new array of unique ListKeyValue objects sorted by their value.
     */
    public static removeDuplicatesAndSort(data: ListKeyValue[]): ListKeyValue[] {
        const uniqueData = Array.from(new Map(data.map(item => [item.key, item])).values());
        return uniqueData.sort((a, b) => {
            const aValue = a.value || '';
            const bValue = b.value || '';
            return aValue.localeCompare(bValue);
        });
    }
}