// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    backendUrl: '/api',
    //backendUrl: 'http://localhost:8080/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

// export const authConfig = {
//   provider: 'websso',
//   providers: {
//     websso: {
//       authority: 'https://oauth-tmsx.test.service.deutschebahn.com/f5-oauth2/v1',
//       client_id: '2321b8d5c89858a9d73387b78bdd02a0ec57b00cd390285d',
//       redirect_uri: 'http://localhost:4200/auth/callback',
//       post_logout_redirect_uri: 'http://localhost:4200/',
//       response_type: 'code',
//       scope: 'openid profile',
//       automaticSilentRenew: true,
//       filterProtocolClaims: true,
//       loadUserInfo: true,
//       extraQueryParams: {token_content_type: 'jwt'}
//     },
//   }
// };
