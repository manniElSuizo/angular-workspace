import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { AppService } from "@src/app/app.service";

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor(private appService: AppService) {}
  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({ setHeaders: { 'Accept-Language': this.appService.language ? this.appService.language.iso : 'en-US'}})
    return next.handle(request);
  }
}
