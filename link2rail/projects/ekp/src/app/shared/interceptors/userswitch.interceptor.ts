import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { EnvService } from "../services/env/env.service";

@Injectable()
export class UserSwitchInterceptor implements HttpInterceptor {
  private allowedUrls: string[] = [];
  constructor(env: EnvService) {
    this.allowedUrls = env.getAllBackendUrls();
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(sessionStorage.getItem("customUsername")) {
      const found = this.allowedUrls.find(url => req.url.startsWith(url));
      if (found) {
        const request = req.clone({
          headers: req.headers.set('X-Custom-Username', encodeURIComponent(sessionStorage.getItem("customUsername"))),
        });
        return next.handle(request);
      }
    }
    return next.handle(req);
  }
}