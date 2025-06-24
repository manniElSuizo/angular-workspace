import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export const CARGO_AUTH_CONFIG = {
    logoutUri: '/api/oauth2/logout',
    loginRedirectUri: '/api/oauth2/authorization/tok',
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient) { }

    logout(): void {
        this.http.post(CARGO_AUTH_CONFIG.logoutUri, {}).subscribe({
            next: () => console.log('Logged out successfully'),
        });
    }
}