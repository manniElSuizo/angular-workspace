import { Injectable } from '@angular/core';
import { KeyValuePair } from './../models/api-dynamic-storage';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicStorageService {

  // Store an array of key-value pairs in sessionStorage under a dynamic list name
  storeKeyValueList(listName: string, keyValueList: KeyValuePair[]): void {
    sessionStorage.setItem(listName, JSON.stringify(keyValueList));
  }

  // Store an array of configurations in sessionStorage under a dynamic list name
  storeConfigurationList(listName: string, configurationList: any[]): void {
    sessionStorage.setItem(listName, JSON.stringify(configurationList));
  }

  // Retrieve a configuration list from sessionStorage by its dynamic list name
  retrieveConfigurationList(listName: string): Observable<any[] | null> {
    const storedData = sessionStorage.getItem(listName);
    return of (storedData ? JSON.parse(storedData) : null);
  }

  // Retrieve an array of key-value pairs from sessionStorage by its dynamic list name
  retrieveKeyValueList(listName: string): Observable<KeyValuePair[] | null> {
    const storedData = sessionStorage.getItem(listName);
    const keyValuePairs = storedData ? JSON.parse(storedData) as KeyValuePair[] : null;

    // Return as Observable
    return of(keyValuePairs);
  }

  // Add a single key-value pair to an existing dynamic list or create a new list if it doesn't exist
  addKeyValuePair(listName: string, newPair: KeyValuePair): void {
    this.retrieveKeyValueList(listName).subscribe(existingList => {
      // Initialize an empty list if no existing list is found
      const updatedList = existingList ? [...existingList] : [];
      // Add the new pair to the list
      updatedList.push(newPair);
      // Store the updated list
      this.storeKeyValueList(listName, updatedList);
    });
  }

  // Remove a specific key-value pair from a list by key
  removeKeyValuePair(listName: string, key: string): void {
    this.retrieveKeyValueList(listName).subscribe(existingList => {
      if (existingList) {
        // Filter out the pair with the matching key
        const updatedList = existingList.filter(pair => pair.key !== key);
        // Store the updated list
        this.storeKeyValueList(listName, updatedList);
      }
    });
  }

  // Remove an entire list from sessionStorage by its dynamic name
  removeKeyValueList(listName: string): void {
    sessionStorage.removeItem(listName);
  }

  // Clear all lists from sessionStorage
  clearAllLists(): void {
    sessionStorage.clear();
  }
}