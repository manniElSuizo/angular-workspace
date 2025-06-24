import { MasterDataCodeType } from "@src/app/shared/models/masterdata-code-translations"

export enum EnumSuitableForRunning {
    //0 - Uneingeschränkt lauffähig
    FULLY_OPERATIONAL = '0',
    // 1 - Sofort aussetzen zur Reparatur
    IMMEDIATE_REPAIR_NEEDED = '1',
    // 2 - Sofort aussetzen - zurechtladen
    IMMEDIATE_UNLOADING_NEEDED = '2',
    //3 - Begrenzt lauffähig – MWS
    LIMITED_OPERATIONAL_MWS = '3',
    // 4 - Darf nicht bewegt werden
    MUST_NOT_BE_MOVED = '4',
    // 5 - Begrenzt lauffähig
    LIMITED_OPERATIONAL = '5',
    // 6 - Eingeschränkt lauffähig
    RESTRICTED_OPERATIONAL = '6'
  }

export interface VehicleByVehicleNumberRequest {
    // VehicleNumber required VehicleNumber:  maxLength: 12   minLength: 12 type: string
    VehicleNumber: string
}


export interface Vehicle {
    // OperationCode  maxLength: 10  minLength: 0  type: string
    operationCode?: string
    // VehicleNumber required VehicleNumber:  maxLength: 12   minLength: 12 type: string
    vehicleNumber: string
    // VehicleNumberPrevious: maxLength: 12 minLength: 12  type: string
    vehicleNumberPrevious?: string
    // ApprovalStateCode: required maxLength: 2 minLength: 1  type: string */
    approvalStateCode: string
    // ProcessingTime: required type: string format: date-time example: '2019-12-12T14:43:12.333Z'*/
    processingTime: string
    technicalAttributes?: TechnicalAttibuts
    currentState?: CurrentState
    damage?: Damage
    loadLimitPattern?: LoadLimitPattern[]
    cluster?: Cluster
    revision?: Revision
    agreement?: Agreement
    wagonBrakes?:WagonBrakes
    masterDataCodeTypes?: MasterDataCodeType[]
}

export interface TechnicalAttibuts {
    // InternationalFreightWagonClass  maxLength: 12  minLength: 0  type: string
    internationalFreightWagonClass?: string,
    // NationalFreightWagonClass: maxLength: 3 minLength: 0 type: string
    nationalFreightWagonClass?: string,
    // SeriesGroupNr: maxLength: 2 minLength: 0 type: string
    seriesGroupNr?: string,
    // TypeOfConstruction:  maxLength: 3  minLength: 0  type: string
    typeOfConstruction?: string,
    // Description:  maxLength: 15  minLength: 0 type: string
    description?: string,
    // IntermodalRelevant: type: boolean
    intermodalRelevant?: boolean
    // TareWeight: maximum: 99999999999 minimum: 0  type: integer  format: int64
    tareWeight?: number
    // TotalWeight: maximum: 999999 minimum: 0 type: integer
    totalWeight?: number
    // HomeStationBvw: maxLength: 6 minLength: 0 type: string
    homeStationBvw?: string
    // HomeStationBst: maxLength: 6 minLength: 0 type: string
    homeStationBst?: string
    // HomeStationRL100: maxLength: 5  minLength: 0 type: string
    homeStationRL100?: string
    // CouplingUIC: maxLength: 1 minLength: 0  type: string
    couplingUIC?: string
    // BogiePivotsDistance: maximum: 99999999999 minimum: 0  type: integer          format: int64
    bogiePivotsDistance?: number
    // BogieWheelBase: maximum: 99999999999 minimum: 0  type: integer  format: int64
    bogieWheelBase?: number
    // WheelBase: maximum: 99999999999 minimum: 0 type: integer format: int64
    wheelBase?: number
    // NumberOfBogies: maxLength: 1 minLength: 0 type: string
    numberOfBogies?: string
    // NumberOfAxles:  maxLength: 2 minLength: 0  type: string
    numberOfAxles?: string
    // MinCurveRadius: maximum: 999999 minimum: 0 type: integer
    minCurveRadius?: number
    // MinRadiusMountainPeak: maximum: 999999 minimum: 0  type: integer
    minRadiusMountainPeak?: number
    // InternalAxleSpacing: maximum: 99999999999  minimum: 0 type: integer format: int64
    internalAxleSpacing?: number,
    // HeatingFlag:  type: boolean
    heatingFlag?: boolean
    // HeatingType:  maxLength: 2  minLength: 0 type: string
    heatingType?: string,
    // MaximumPayload: maximum: 99999.9 minimum: 0 type: number
    maximumPayload?: number
    // LoadingLevelHeight: maximum: 99999999999 minimum: 0 type: integer format: int64
    loadingLevelHeight?: number
    // HeightLoadingPlane: maximum: 99999999999 minimum: 0  type: integer format: int64
    heightLoadingPlane?: number
    // MaximumSpeedLoaded: maximum: 999999 minimum: 0 type: integer
    maximumSpeedLoaded?: number
    // MaximumSpeedEmpty: maximum: 999999  minimum: 0   type: integer
    maximumSpeedEmpty?: number
    // MaximumSpeedPermitted: maximum: 999999 minimum: 0 type: integer
    maximumSpeedPermitted?: number
    // MaxSpeedG: type: boolean
    maxSpeedG?: boolean
    // LoadingLength: maximum: 99999999999 minimum: 0 type: integer format: int64
    loadingLength?: number,
    // LoadingArea: maximum: 999.9 minimum: 0  multipleOf: 0.1  type: number
    loadingArea?: number
    // LoadingVolume: maximum: 999.9 minimum: 0 multipleOf: 0.1  type: number
    loadingVolume?: number
    // LengthOverBuffers: maximum: 99999999999  minimum: 0 type: integer format: int64
    lengthOverBuffers?: number,
    // TypeOfParkingBrake: maxLength: 1 minLength: 0 type: string
    typeOfParkingBrake?: string
    // EnergySupplyType:  maxLength: 1 minLength: 0  type: string
    energySupplyType?: string
    // TypeOfLimitation: maxLength: 2 minLength: 0   type: string
    typeOfLimitation?: string
    // AssetAcc: maxLength: 3 minLength: 0  type: string
    assetAcc?: string
    // BasicDispositionType: maxLength: 3 minLength: 0  type: string
    basicDispositionType?: string
    // SubtypeOfConstruction: type: array items: $ref: "#/components/schemas/SubtypeOfConstruction"
    subtypeOfConstruction?: SubtypeOfConstruction[]
}
export interface SubtypeOfConstruction {
    //  required:  ModelSpecificSpecialHandling
    modelSpecificSpecialHandling: ModelSpecificSpecialHandling
}

export interface ModelSpecificSpecialHandling {
    // ModelSpecificSpecialHandling: maxLength: 2 inLength: 0 type: string
    modelSpecificSpecialHandling: string
}

export interface CurrentState {
    // VehicleKeeperCode: maxLength: 5 minLength: 0  type: string
    vehicleKeeperCode?: string
    // VehicleKeeperMarking: maxLength: 8  minLength: 0 type: string
    vehicleKeeperMarking?: string
    // VehicleType:  maxLength: 3    minLength: 0 type: string
    vehicleType?: string
    // CostCentre: maxLength: 11  minLength: 0  type: string
    costCentre?: string
    // CostCentre2: maxLength: 11  minLength: 0   type: string
    costCentre2?: string
    // CostCentre2ValidFrom:  type: string format: date  example: '2019-12-12'
    costCentre2ValidFrom?: string
    // OperabilityOfBrakes: maxLength: 1 minLength: 0  type: string
    operabilityOfBrakes: string
    // HandbrakeWorking:  maximum: 999999  minimum: 0  type: integer
    handbrakeWorking?: number
    // SuitableForRunning:  maxLength: 1 minLength: 0  type: string
    suitableForRunning?: string
    // DispoCriteria:  maxLength: 2 minLength: 0 type: string
    dispoCriteria?: string
    // StateOfBrake: maxLength: 1 minLength: 0   type: string
    stateOfBrake?: string
}

export interface Damage {
    // MaintenanceGrade: type: array items: type: string maxLength: 3  minLength: 0
    maintenanceGrade?: string[]
    // PeakPeriod: type: string format: date  example: '2019-12-12'
    peakPeriod?: string
    // PeakFlag: type: boolean
    peakFlag?: boolean
    // InteropBorderLine: maxLength: 1 minLength: 0 type: string
    interopBorderLine?: string
    // DamageDeploymentConstraint:  type: array  items:  maxLength: 2 minLength: 0 type: string
    damageDeploymentConstraint?: string[]
    // DamageMaxSpeed:  maximum: 999999  minimum: 0  type: integer
    damageMaxSpeed?: number,
    // WagonInspecLastDateTime: $ref: "common-schemas.yaml#/components/schemas/LocalDateTime"
    wagonInspecLastDateTime?: string ,
    // WagonInspecLastBvw: maxLength: 6 minLength: 0 type: string
    wagonInspecLastBvw?: string
    // WagonInspecLastBst: maxLength: 6  minLength: 0  type: string
    wagonInspecLastBst?: string
    // WagonInspecLastRL100:  maxLength: 5  minLength: 0 type: string
    wagonInspecLastRL100?: string
    // LastDamageTreatment: maxLength: 6 minLength: 0 type: string
    lastDamageTreatment?: string
    // LastDamageTreatmentDay: maxLength: 2 minLength: 0  type: string
    lastDamageTreatmentDay?: string
    // WorkshopType: maxLength: 2 minLength: 0  type: string
    workshopType?: string
    // DamageAccount: maximum: 999999 minimum: 0 type: integer
    damageAccount?: number
    // WorkshopBvw: maxLength: 6 minLength: 0 type: string
    workshopBvw?: string
    // WorkshopBst: maxLength: 6  minLength: 0  type: string
    workshopBst?: string,
    // WorkshopDateTime:$ref: "common-schemas.yaml#/components/schemas/LocalDateTime"
    workshopDateTime?: string
    //  DamageAccountWorkshopBvw: maxLength: 2 minLength: 0 type: string
    damageAccountWorkshopBvw?: string
    // DamageAccountWorkshopBst: maxLength: 6  minLength: 0    type: string
    damageAccountWorkshopBst?: string
    // DamageType: type: array items: $ref: "#/components/schemas/DamageType"
    damageType?: DamageType[]
}
export interface DamageType {
      // DamageTypeCode: maxLength: 3  minLength: 0  type: string
      damageTypeCode?: string
      // DamageCauseCode: maxLength: 1   minLength: 0    type: string
      damageCauseCode?: string
      // DamageCodeAvv:  maxLength: 10  minLength: 0   type: string
      damageCodeAvv?: string
}

export interface LocalDateTime {
    //pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'
    //description: "Local date-time in the format YYYY-MM-DDTHH:MM:SS (e.g., 2024-06-25T14:30:00)"
}

export interface LoadLimitPattern {
    // required:  - X
    x : XType[],
    // CountryCode:  type: array  items:  maxLength: 2   minLength: 0    type: string
    countryCode?:string[]
}

export interface XType {
    // XType   required:- SpeedLimit - Y
    //  * SpeedLimit:  maxLength: 4 minLength: 1   type: string
    speedLimit: string
    // Y: items: $ref: "#/components/schemas/YType"     minItems: 1   type: array
    y: YType[]
    // Asterisks: maxLength: 3 minLength: 0  type: string
    asterisks?: string
}

export interface YType {
    // required: - LineCategory  - LoadLimit
    //LineCategory:  maxLength: 3  minLength: 0  type: string
    lineCategory: string,
    // LoadLimit maximum: 999.9 minimum: 0 multipleOf: 0.1 type: number
    loadLimit: number
}

export interface Cluster {
    //Cluster: type: object
    //ClusterCode: maxLength: 7 minLength: 0 type: string
    clusterCode?: string
    //  ClusterFleet2: maxLength: 7 minLength: 0  type: string
    clusterFleet2?: string
    // ValidFromForFleet2: type: string format: date  example: '2019-12-12'
    validFromForFleet2?: string
}

export interface Revision {
    // RevisionPeriod: maximum: 999999 minimum: 0  type: integer
    revisionPeriod?: number
    // RevisionTolerance: maximum: 999999 minimum: 0  type: integer
    revisionTolerance?: number
    // PeriodDuration: maximum: 999999  minimum: 0   type: integer
    periodDuration?: number
    // DateNextRevision: type: string  format: date  example: '2019-12-12'
    dateNextRevision?: string
    // DateLastRevision:  type: string  format: date example: '2019-12-12'
    dateLastRevision?: string
    // DatePeriod: type: string format: date  example: '2019-12-12'
    datePeriod?: string
}

export interface Agreement {
    // AgreementBvw: maxLength: 2 minLength: 0  type: string
    agreementBvw?: string
    //AdditionalPermittedLines: maxLength: 1 minLength: 0   type: string
    additionalPermittedLines?: string
}

export interface WagonBrakes {
    // ParkingBrakeTypeMassBraked: maximum: 999999  minimum: 0  type: integer
    parkingBrakeTypeMassBraked?: number
    //FactorsLoadProportionalBraking: maximum: 999999 minimum: 0 type: integer
    factorsLoadProportionalBraking?: number
    // BrakedMassAutomatically: maximum: 999999  minimum: 0 type: integer
    brakedMassAutomatically?: number
    // BrakedMassRRhombus: maximum: 999 minimum: 0 type: integer
    brakedMassRRhombus?: number
    // BrakedMassRWhite:  maximum: 999999  minimum: 0 type: integer
    brakedMassRWhite?: number
    // BrakedMassRMG: maximum: 999999 minimum: 0  type: integer
    brakedMassRMG?: number
    // BrakedMassRRed: maximum: 999999 minimum: 0 type: integer
    brakedMassRRed?: number
    // BrakeChangeOverWeight: maximum: 999999  minimum: 0 type: integer
    brakeChangeOverWeight?: number,
    // BrakedMassGLoaded: maximum: 999999 minimum: 0 type: integer
    brakedMassGLoaded?: number
    // BrakedMassGEmpty:  maximum: 999999 minimum: 0 type: integer
    brakedMassGEmpty?: number
    // BrakedMassPLoaded: maximum: 999999 minimum: 0 type: integer
    brakedMassPLoaded?: number
    // BrakedMassPEmpty:  maximum: 999999 minimum: 0 type: integer
    brakedMassPEmpty?: number
    // BrakeType: maxLength: 2 minLength: 0 type: string
    brakeType?: string
    // CurrentBrakedMass:  maximum: 999999 minimum: 0 type: integer
    currentBrakedMass?: number
    // BrakeKind: maxLength: 1 minLength: 0 type: string
    brakeKind?: string
    // ParkingBrakeForce: maximum: 999.9 minimum: 0 multipleOf: 0.1 type: number
    parkingBrakeForce?: number
    //$ref: "#/components/schemas/MassBrakes" type: array
    massBrakes?: MassBrakes[]
}

export interface MassBrakes {
    //  ChargeWeight: maximum: 999 minimum: 0 type: integer
    chargeWeight?: number,
    //MassBraked: maximum: 999 minimum: 0 type: integer
    massBraked?: number
}
