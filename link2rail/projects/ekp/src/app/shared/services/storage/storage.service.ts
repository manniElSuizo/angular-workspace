import { Injectable } from "@angular/core";
import { StorageServiceBase } from "./storage.service.base";

@Injectable({
    providedIn: 'root'
})

export class StorageService extends StorageServiceBase {
    constructor() {
        super(localStorage);
    }
}