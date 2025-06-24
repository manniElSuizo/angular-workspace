export enum InternalApiUrls {
    RAIL_AUTHORITIES = "/rail-authorities",
    COUNTRIES = "/countries",
    LOADING_POINTS = "/loading-points?locationNumber={locationNumber}",
    PRODUCTS = "/products?transportationType={transportationType}",
    COMMERCIAL_LOCATION = "/commercial-locations?",
    COMMERCIAL_AND_BORDER_LOCATIONS= "/commercial-and-border-locations",
    CONSIGNOR_DECLARATIONS = "/consignor-declarations/codes",
    DANGEROUS_GOOD_LAWS = "/dangerous-good-laws",
    RAIL_ORDERS_COMMERCIAL_LOCATIONS_URL = '/rail-orders/commercial-locations'
}

export enum InternalCodeTableUrl {
    COMMERCIAL_SERVICES ="/commercial-services/", //KOMZULEI
    SUPPLIERS = "/suppliers/", // TOMRUS
    MARKET_SEGMENTS = "/market-segments/", //TOMMARKT
    WORKING_DIRECTIONS = "/working-directions/", // ARB_RICH
    RUNNING_ABILITIES= "/running-abilities/",
    ALLOWED_MODES_OF_TRANSPORT= "/allowed-modes-of-transport/",
    MODES_OF_TRANSPORT= "/modes-of-transport/",
    ORDER_STATES= "/order-states/",
    RAILWAY_COMPANIES= "/railway-companies/",
    SCRAP= "/scrap/",
    PACKAGING_TYPES= "/packaging-types/",
    MRN_TYPES= "/mrn-types/",
    SPECIAL_INSTRUCTIONS= "/special-instructions/",
    LOADING_TACKLES= "/loading-tackles/",
    COMMERCIAL_SPECIFICATIONS= "/commercial-specifications/", // KOMBEDNG
    CONSIGNOR_DECLARATIONS= "/consignor-declarations/", // ABSEERKL
    SUPPLEMENT_TYPES= "/supplement-types/", // REFART
    WAGON_TYPES = "TODO", // GATZEICH
    ORDER_REASONS = "TODO", //INTBEGRU  
    TRANSPORTATION_TYPES = "/transportation-types/"
}