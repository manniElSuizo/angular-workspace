export const environment = {
  production: true,
  backendUrl: '/api'
};

// TODO replace this with a production ready configuration
export const authConfig = {
  provider: 'websso',
  providers: {
    websso: {
      authority: 'https://oauth-tmsx.test.service.deutschebahn.com/f5-oauth2/v1',
      client_id: '2321b8d5c89858a9d73387b78bdd02a0ec57b00cd390285d',
      redirect_uri: window.location.origin + '/auth/callback',
      post_logout_redirect_uri: window.location.origin,
      response_type: 'code',
      scope: 'openid profile',
      automaticSilentRenew: true,
      filterProtocolClaims: true,
      loadUserInfo: true,
      extraQueryParams: {token_content_type: 'jwt'}
    },
  }
};
