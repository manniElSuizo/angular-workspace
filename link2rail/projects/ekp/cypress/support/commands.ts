// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

export interface SessionData {
  cookies: Cookie[];
  lsd: LocalStorageData;
  ssd: SessionStorageData;
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number | undefined;
  httpOnly: boolean;
  secure: boolean;
}

export interface LocalStorageData {
  [key: string]: string;
}

export interface SessionStorageData {
  [key: string]: string;
}

export interface UserCreationBodyOverrides {
  username?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  groups?: string;
  mail?: string;
  lifetime?: number;
}

/**
 * export chained types to be used in specs
 */
declare global {
  namespace Cypress {
    interface Chainable {
      restoreSession(arg: SessionData): void;
      createUser(options?: {
        url?: string;
        body?: UserCreationBodyOverrides;
      }): Cypress.Chainable<Cypress.Response>;
      deleteUser(userId: string): Cypress.Chainable<Cypress.Response>;
    }
  }
}

/**
 * restore session data
 */
function restoreSession(arg: SessionData) {
  const { cookies, lsd, ssd } = arg;
  const wList: string[] = [];
  cy.clearCookies();
  cookies.forEach((cookie) => {
    wList.push(cookie.name);
    cy.setCookie(cookie.name, cookie.value, {
      log: true,
      domain: cookie.domain,
      path: cookie.path,
      expiry: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
    });
  });

  Cypress.Cookies.defaults({ preserve: wList });

  cy.window().then((window) => {
    Object.keys(ssd).forEach((key) =>
      window.sessionStorage.setItem(key, ssd[key])
    );
    Object.keys(lsd).forEach((key) =>
      window.localStorage.setItem(key, lsd[key])
    );
  });
}
Cypress.Commands.add('restoreSession', restoreSession);

/**
 * create a temp user
 */
function createUser(options?: {
  url?: string;
  body?: UserCreationBodyOverrides;
}): Cypress.Chainable<Cypress.Response> {
  Cypress.log({
    name: 'Creating a temp User for authentication tests',
  });
  const opts = {
    method: 'POST',
    url: options?.url || Cypress.env('login_user_management_url'),
    body: {
      username: options?.body?.username || Cypress.env('login_username'),
      password: options?.body?.password || Cypress.env('login_password'),
      firstname: options?.body?.firstname || Cypress.env('login_firstname'),
      lastname: options?.body?.lastname || Cypress.env('login_lastname'),
      groups: options?.body?.groups || Cypress.env('login_groups'),
      mail: options?.body?.mail || Cypress.env('login_mail'),
      lifetime: options?.body?.lifetime || Cypress.env('login_lifetime'),
    },
    failOnStatusCode: false, // allow a 400 response if user is already registered, the returning ID in the body will be the same
  };
  return cy.request(opts);
}
Cypress.Commands.add('createUser', createUser);

/**
 * delete a temp created user
 */
function deleteUser(userId: string): Cypress.Chainable<Cypress.Response> {
  Cypress.log({
    name: 'Delete temp created user',
  });
  const options = {
    method: 'DELETE',
    url: `${Cypress.env('login_user_management_url')}/${userId}`,
  };
  return cy.request(options);
}
Cypress.Commands.add('deleteUser', deleteUser);
