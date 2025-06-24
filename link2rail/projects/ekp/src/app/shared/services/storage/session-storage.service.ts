import { Injectable } from "@angular/core";
import { StorageServiceBase } from "./storage.service.base";

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService extends StorageServiceBase {
    constructor() {
        super(sessionStorage);
    }
}