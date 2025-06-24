import { Injectable } from "@angular/core";

export interface AutocompleteDataList<T> {
    displayValue: string;
    value: T;
}

@Injectable({
    providedIn: 'root'
})
export class AutocompleteService {

    public resultListToDataList<T>(resultList: T[], displayName: (a: T) => string): AutocompleteDataList<T>[] {
        const arr: AutocompleteDataList<T>[] = [];
        resultList.forEach((element: T) => arr.push({ displayValue: displayName(element), value: element }));

        return arr;
    }

    public findByDisplayName<T>(displayName: string, list: AutocompleteDataList<T>[]): T {
        const found = list.find(element => element.displayValue == displayName);
        if(!found) {
            return null;
        }
        return found.value;
    }
}