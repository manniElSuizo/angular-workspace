import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class EnvService {

    // The values that are defined here are the default values that can
    // be overridden by env.js

    // API url
    //public backendUrl = 'https://trainorder-backend-dev.lso-test.comp.db.de/api';
    public backendUrl = '/api/tok/v1';
    public backendUrlOm = '/api/om/v1';
    public backendUrlTnt = '/api/tnt/v1';
    public backendUrlEwd = '/api/ewd/v1';
    public backendUrlInv = '/api/inv/v1';
    public backendUrlUserManagement = '/api/usermanagement';

    public production = true;

    // Whether or not to enable debug mode
    public enableDebug = true;

    public issuer = 'https://ssocargo-mts.test.service.deutschebahn.com:8443/f5-oauth2/v1/';
    // public redirectUri = 'https://tok-dev.intranet.deutschebahn.com/gzp/trainorder/home';
    public clientId = '1f18a971b6f8528406a8a53d1f8d02a0ec57b00c63d06463';

    constructor() {
    }

    public getAllBackendUrls(): string[] {
        return [this.backendUrlUserManagement, this.backendUrlTnt, this.backendUrlOm, this.backendUrl];
    }

}
