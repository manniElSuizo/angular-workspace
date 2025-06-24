import { EnvService } from './env.service';

export let oneAndOnlyEnvInstance: any = null;

export const EnvServiceFactory = (): EnvService => {
    // console.log("start env service factory");
    // Create env
    if (oneAndOnlyEnvInstance == null || !(oneAndOnlyEnvInstance instanceof EnvService)) {
        // console.log("instantiate EnvService");
        oneAndOnlyEnvInstance = new EnvService();

        // Read environment variables from browser window
        const browserWindow: any = window || {};
        const browserWindowEnv = browserWindow['__env'] || {};

        // Assign environment variables from browser window to env
        // In the current implementation, properties from env.js overwrite defaults from the EnvService.
        // If needed, a deep merge can be performed here to merge properties instead of overwriting them.
        for (const key in browserWindowEnv) {
            if (browserWindowEnv.hasOwnProperty(key)) {
                oneAndOnlyEnvInstance[key] = (window as any)['__env'][key];
            }
        }
    }

    return oneAndOnlyEnvInstance;
};

export const EnvServiceProvider = {
    provide: EnvService,
    useFactory: EnvServiceFactory,
    deps: [],
};
