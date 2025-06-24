import {ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import '@angular/common/locales/global/de';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ErrorComponent} from './shared/error/error.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TrainIdPipe} from './trainorder/pipes/train-id.pipe';
import {TrainTypePipe} from './trainorder/pipes/train-type.pipe';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {GlobalErrorHandler} from './shared/error-handler/error-handler';
import {HeaderModule} from './shared/components/header/header.module';
import {FooterModule} from './shared/components/footer/footer.module';
import {LanguageInterceptor} from './shared/interceptors/language.interceptor';
import {EnvServiceFactory, EnvServiceProvider} from './shared/services/env/env.service.provider';
import {ModalWindows} from './shared/components/modal-windows/modal-windows';
import {SystemInformationModule} from './system-information/system-information.module';
import {LoggingInterceptor} from './shared/interceptors/logging.interceptor';
import {TypeOfConsignmentModel} from './order-management/components/new-order/models/type-of-consignment.class';
import {UserSwitchInterceptor} from './shared/interceptors/userswitch.interceptor';
import { DBUIElementsModule } from '@db-ui/ngx-elements-enterprise/dist/lib';
import { UnauthorizedInterceptor } from './shared/interceptors/unauthorized.interceptor';

const envService = EnvServiceFactory();

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http,'./assets/i18n/merged/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        ErrorComponent,
    ],
    imports: [
    DBUIElementsModule,
    BrowserModule,
    AppRoutingModule,
    HeaderModule,
    FooterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SystemInformationModule,
    NgMultiSelectDropDownModule.forRoot(),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    })
],
    providers: [
        TrainIdPipe,
        {provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: UserSwitchInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true},
        {provide: LOCALE_ID, useValue: 'de-DE'},
        EnvServiceProvider,
        TrainTypePipe,
        ModalWindows,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        TypeOfConsignmentModel
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
