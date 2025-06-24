import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { InternalCodeTableUrl } from "./internal-api-urls";
import { CodeNamePair } from "../models/general-order";
import { map, Observable } from "rxjs";
import { EnvService } from "@src/app/shared/services/env/env.service";

export class CodeTablesService {

    protected backendUrl: string;
    protected httpClient: HttpClient = inject(HttpClient);

    protected env: EnvService = inject(EnvService);
    constructor() {
        this.backendUrl = this.env?.backendUrl;
        if (typeof this.backendUrl == 'undefined' || this.backendUrl == null) {
          console.info("no environment setting for backendUrl found!");
        }
    }

    private getCodeTable(resource: InternalCodeTableUrl): Observable<CodeNamePair[]> {
        let internalUrl = `${resource}codes`;

        // Perform HTTP GET request to the constructed URL
        return this.httpClient.get<CodeNamePair[]>(`${this.backendUrl}${internalUrl}`);
    }

    public getAllowedModeOfTransport(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.ALLOWED_MODES_OF_TRANSPORT).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getTransportationTypes(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.TRANSPORTATION_TYPES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getCommercialServices(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.COMMERCIAL_SERVICES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getCommercialSpecifications(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.COMMERCIAL_SPECIFICATIONS).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getConsignorDeclarations(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.CONSIGNOR_DECLARATIONS).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getLoadingTackles(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.LOADING_TACKLES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getMarketSegments(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.MARKET_SEGMENTS).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getModesOfTransport(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.MODES_OF_TRANSPORT).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getMrnTypes(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.MRN_TYPES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getOrderStates(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.ORDER_STATES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getPackagingTypes(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.PACKAGING_TYPES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getRailwayCompanies(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.RAILWAY_COMPANIES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getRunningAbilities(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.RUNNING_ABILITIES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getScrap(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.SCRAP).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getSpecialInstructions(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.SPECIAL_INSTRUCTIONS).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getSupplementTypes(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.SUPPLEMENT_TYPES).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }
    public getSuppliers(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.SUPPLIERS).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    public getWorkingDirections(): Observable<CodeNamePair[]> {
        return this.getCodeTable(InternalCodeTableUrl.WORKING_DIRECTIONS).pipe(
            map((specifications) => this.sortCodeNamePairsByName(specifications))
          );
    }

    private sortCodeNamePairsByName(pairs: CodeNamePair[]): CodeNamePair[] {
        return pairs.sort((a, b) => a.name.localeCompare(b.name));
      }
}
