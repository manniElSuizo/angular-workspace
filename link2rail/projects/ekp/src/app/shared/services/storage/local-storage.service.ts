import { Injectable } from "@angular/core";
import { StorageServiceBase } from "./storage.service.base";

@Injectable({
    providedIn: 'root'
})

export class LocalStorageService extends StorageServiceBase {
    constructor() {
        super(localStorage);
    }
}