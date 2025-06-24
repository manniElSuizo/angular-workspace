(function (window) {
    window.__env = window.__env || {};

    // API url

    // window.__env.backendUrl = 'https://trainorder-backend-dev.lso-test.comp.db.de/api/tok/v1';

    // window.__env.backendUrlUserManagement = 'http://localhost:8080/api/usermanagement';
    window.__env.production = false;

    // Whether or not to enable debug mode
    // Setting this to false will disable console output
    window.__env.enableDebug = true;

    window.__env.issuer = 'https://ssocargo-mts.test.service.deutschebahn.com:8443/f5-oauth2/v1/';
    window.__env.redirectUri = 'http://localhost:4200/gzp/trainorder/home';
    window.__env.clientId = '1f18a971b6f8528406a8a53d1f8d02a0ec57b00c63d06463';
}(this));