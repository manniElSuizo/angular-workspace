import {NgModule} from '@angular/core';
import {EmptyWagonRoutingModule} from './empty-wagon.routes';
import {ApiModule, Configuration, ConfigurationParameters} from "./api/generated";

export function apiConfigFactory(): Configuration {
    const params: ConfigurationParameters = {
        basePath: "/api/ewd/v1",

    };
    return new Configuration(params);
}

@NgModule({
    declarations: [],
    imports: [
        ApiModule.forRoot(apiConfigFactory),
        EmptyWagonRoutingModule,

    ],
})
export class EmptyWagonModule {
}

