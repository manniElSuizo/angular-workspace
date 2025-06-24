import {
    KeyValuePair,
    RAILORDER_AUTHORITYLIST_LISTNAME,
    RAILORDER_CORE_CONFIGURATION_KEY_DATA_LISTNAME,
    RAILORDER_DANGEROUSGOOD_LAW_LISTNAME,
    RAILORDER_TRANSPORTATIONTYPE_LISTNAME,
    RAILORDER_TYPE_OF_TRANSPORT_CODE_LISTNAME,
    RAILORDER_CONSIGNMENT_TYPES_LISTNAME,
    RAILORDER_COUNTRY_LISTNAME,
    RAILORDER_SERVICE_SERVICE_TYPES_LISTNAME,
    RAILORDER_SERVICE_PAYMENTMETHOD_TYPES_LISTNAME,
    RAILORDER_COMMERCIAL_CURRENCY_LISTNAME

} from "../components/new-order/models/api-dynamic-storage";

import { DynamicStorageService } from "../components/new-order/service/dynamic-session-storage.service";

export class PrepareOrderSessionMocks {

    constructor(private dynamicStorageService: DynamicStorageService) { }

    public prepareSessionParameter() {

        this.createDangerousgoodLawList();
        this.createTypeOfTransportCodeList();
        this.createRailOrderCoreConfigurationKeyData();
        this.createTransportationTypeList();
        this.createAuthorityList();
        this.createConsignmentTypesList();
        this.createCountryList();
        this.createServiceTypeList();
        this.createPaymentMethodTypeList();
        this.createCurrencyList(); 
    };

    private createCurrencyList() {
      const currencyList : KeyValuePair[] = [
        {
          "key": "ALL",
          "value": "Alban. Lek"
        },
        {
          "key": "BAD",
          "value": "Barbados Dollar"
        },
        {
          "key": "BAM",
          "value": "BAM"
        },
        {
          "key": "BGN",
          "value": "BGN"
        },
        {
          "key": "CAD",
          "value": "Kanad. Dollar"
        },
        {
          "key": "CHF",
          "value": "Schweizer Franken"
        },
        {
          "key": "CZK",
          "value": "Tschechische Krone"
        },
        {
          "key": "DKK",
          "value": "Dänische Krone"
        },
        {
          "key": "EEK",
          "value": "Estnische Krone"
        },
        {
          "key": "EUR",
          "value": "Euro"
        },
        {
          "key": "GBP",
          "value": "Britisches Pfund"
        },
        {
          "key": "HRK",
          "value": "HRK"
        },
        {
          "key": "HUF",
          "value": "Ungarische Forint"
        },
        {
          "key": "LTL",
          "value": "Litauische Litas"
        },
        {
          "key": "MKD",
          "value": "MKD"
        },
        {
          "key": "NOK",
          "value": "NOK NKR"
        },
        {
          "key": "PLN",
          "value": "Polnischer Zloty"
        },
        {
          "key": "RON",
          "value": "Rumänischer Leu"
        },
        {
          "key": "RSD",
          "value": "RSD"
        },
        {
          "key": "RUB",
          "value": "Russische Rubel"
        },
        {
          "key": "SEK",
          "value": "Schwedische Krone"
        },
        {
          "key": "SIT",
          "value": "Tolar"
        },
        {
          "key": "SKK",
          "value": "Slowakische Krone"
        },
        {
          "key": "TRY",
          "value": "Türkische Lira"
        },
        {
          "key": "USD",
          "value": "US-Dollar"
        },
        {
          "key": "XDR",
          "value": "XDR"
        }
      ]
      this.dynamicStorageService.storeKeyValueList(RAILORDER_COMMERCIAL_CURRENCY_LISTNAME, currencyList);
    }

    private createConsignmentTypesList() {
        const consignmentTypesList: KeyValuePair[] = [
            { key: "CIM", value: " CIM Internationaler Transport" },
            { key: "CUV", value: "CUV" },
            { key: "NAT", value: " Nationaler Transport" },
        ]
        this.dynamicStorageService.storeKeyValueList(RAILORDER_CONSIGNMENT_TYPES_LISTNAME, consignmentTypesList);
    };

    private createTransportationTypeList(): void {
        const transportationTypeList: KeyValuePair[] = [
            { key: "AT", value: "Abfalltransport" },
            { key: "CO", value: "Containertransport" },
            { key: "KT", value: "Kriegswaffentransport" },
            { key: "NT", value: "Normaler Transport" },
            { key: "AT", value: "Abfalltransport" },
            { key: "RL", value: "Rollende Landstraße" },
        ];
        this.dynamicStorageService.storeKeyValueList(RAILORDER_TRANSPORTATIONTYPE_LISTNAME, transportationTypeList);

    };

    private createServiceTypeList(): void {
        const serviceTypeList: KeyValuePair[] = [
            { key: "560", value: "Abrufvverf. wg.NR." },
            { key: "196", value: "Abrufverfahren" },
            { key: "443", value: "N.verfüg.:Aussetzen" },
            { key: "715", value: "Reinigung/Entseucht" },
            { key: "425", value: "Sammelzollverfahren" },
            { key: "821", value: "Sonstige Nebenleistungen" },
            { key: "342", value: "Wiegegeld Empfang" },
            { key: "341", value: "Wiegegeld Versand" },
            { key: "451", value: "Vorführung zur VuB" },
            { key: "344", value: "Wiegen P-Waage Kunde Versand" },
            { key: "345", value: "Wiegen P-Waage unterwegs" },
            { key: "411", value: "Zollbeh.Grenz/Unterw" },
        ];
        this.dynamicStorageService.storeKeyValueList(RAILORDER_SERVICE_SERVICE_TYPES_LISTNAME, serviceTypeList);

    };

    private createPaymentMethodTypeList(): void {
        const paymentMethodTypeList: KeyValuePair[] = [
            { key: "01", value: "Freibetrag" },
            { key: "02", value: "Überweisung" },
        ];
        this.dynamicStorageService.storeKeyValueList(RAILORDER_SERVICE_PAYMENTMETHOD_TYPES_LISTNAME, paymentMethodTypeList);

    };

    private createRailOrderCoreConfigurationKeyData(): void {
        const coreConfigurationKeyData = [
            { typeOfTransportCodeKey: '01', productId: '0001', value: 'Einzelwagen' },
            { typeOfTransportCodeKey: '01', productId: '0003', value: 'RailIndustrySolution Classic' },
            { typeOfTransportCodeKey: '01', productId: '0015', value: 'STINNESDisposalSolution Classic' },
            { typeOfTransportCodeKey: '01', productId: '0036', value: 'Proki A/B Verbindung mit BBA 1' },
            { typeOfTransportCodeKey: '01', productId: '0037', value: 'Proki A/C Verbindung mit BBA 1' },
            { typeOfTransportCodeKey: '01', productId: '0036', value: 'Proki A/D Verbindung mit BBA 1' },
            { typeOfTransportCodeKey: '01', productId: '0043', value: 'Netzwerkangebot Einzelwagen' },
            { typeOfTransportCodeKey: '02', productId: '0016', value: 'STINNESDisposalSolution Quality' },
            { typeOfTransportCodeKey: '03', productId: '0042', value: 'RailionAutomotiveSolutionKV' },
            { typeOfTransportCodeKey: '04', productId: '0004', value: 'Einzelwagen' },
            { typeOfTransportCodeKey: '04', productId: '0012', value: 'RAILIONchem-solution' },
            { typeOfTransportCodeKey: '04', productId: '0014', value: 'STINNESDisposalSolution Classic' },
            { typeOfTransportCodeKey: '04', productId: '0017', value: 'RailionAutomotiveSolution' },
            { typeOfTransportCodeKey: '04', productId: '0027', value: 'STINNESDisposalSolution Prime' },
            { typeOfTransportCodeKey: '04', productId: '0028', value: 'PaperSolution Q' },
            { typeOfTransportCodeKey: '04', productId: '0039', value: 'Proki A/B Verbindung mit BBA 4' },
            { typeOfTransportCodeKey: '04', productId: '0040', value: 'Proki A/C Verbindung mit BBA 4' },
            { typeOfTransportCodeKey: '04', productId: '0041', value: 'Proki A/D Verbindung mit BBA 4' },
            { typeOfTransportCodeKey: '04', productId: '0044', value: 'DB Schenkersteel-solution' },
            { typeOfTransportCodeKey: '04', productId: '0099', value: 'Einzelwagen' },
            { typeOfTransportCodeKey: '05', productId: '0005', value: 'Plantrain' },
            { typeOfTransportCodeKey: '05', productId: '0007', value: 'Flextrain' },
            { typeOfTransportCodeKey: '05', productId: '0008', value: 'Flextrain' },
            { typeOfTransportCodeKey: '05', productId: '0018', value: 'STINNESDisposalSolution Plantrain' },
            { typeOfTransportCodeKey: '05', productId: '0019', value: 'STINNESDisposalSolution Variotrain' },
            { typeOfTransportCodeKey: '05', productId: '0020', value: 'STINNESDisposalSolution Flextrain' },
            { typeOfTransportCodeKey: '05', productId: '0021', value: 'OilSolution Plantrain' },
            { typeOfTransportCodeKey: '05', productId: '0023', value: 'RailIndustrySolution Flextrain' },
        ];

        this.dynamicStorageService.storeConfigurationList(RAILORDER_CORE_CONFIGURATION_KEY_DATA_LISTNAME, coreConfigurationKeyData);
    };


    private createTypeOfTransportCodeList(): void {
        const typeOfTransportCodeList: KeyValuePair[] = [
            { key: "01", value: "Einzelwagen, Wagengruppen" },
            { key: "02", value: "Einzelwagen, Wagengruppen (alt: Qualtity-Wagen)" },
            { key: "03", value: "Sendungen des Kombinierten Verkehrs (KV)" },
            { key: "04", value: "Einzelwagen, Wagengruppen (alt: ICG)" },
            { key: "05", value: "Geschlossene Züge (Ganzzüge)" }

        ];
        this.dynamicStorageService.storeKeyValueList(RAILORDER_TYPE_OF_TRANSPORT_CODE_LISTNAME, typeOfTransportCodeList);
    };

    private createDangerousgoodLawList(): void {
        const dangerousgoodLawList: KeyValuePair[] = [
            { key: "R", value: "RID neu (ab 01.01.2023)" }
        ];

        this.dynamicStorageService.storeKeyValueList(RAILORDER_DANGEROUSGOOD_LAW_LISTNAME, dangerousgoodLawList);
    };


    private createCountryList(): void {
        const countryList = [
            {
              "ISOCode": "AT",
              "Description": "Österreich",
              "UICCountryCode": "81",
              "Alphacode": "A"
            },
            {
              "ISOCode": "AL",
              "Description": "Albanien",
              "UICCountryCode": "41",
              "Alphacode": "AL"
            },
            {
              "ISOCode": "AZ",
              "Description": "Aserbaidschan",
              "UICCountryCode": "57",
              "Alphacode": "AZ"
            },
            {
              "ISOCode": "BE",
              "Description": "Belgien",
              "UICCountryCode": "88",
              "Alphacode": "B"
            },
            {
              "ISOCode": "BG",
              "Description": "Bulgarien",
              "UICCountryCode": "52",
              "Alphacode": "BG"
            },
            {
              "ISOCode": "BA",
              "Description": "Bosnien-Herzegowina",
              "UICCountryCode": "49",
              "Alphacode": "BIH"
            },
            {
              "ISOCode": "BY",
              "Description": "Belarus (Weißrußland)",
              "UICCountryCode": "21",
              "Alphacode": "BY"
            },
            {
              "ISOCode": "CH",
              "Description": "Schweiz",
              "UICCountryCode": "85",
              "Alphacode": "CH"
            },
            {
              "ISOCode": "CZ",
              "Description": "Tschechische Republik",
              "UICCountryCode": "54",
              "Alphacode": "CZ"
            },
            {
              "ISOCode": "DE",
              "Description": "Deutschland",
              "UICCountryCode": "80",
              "Alphacode": "D"
            },
            {
              "ISOCode": "DK",
              "Description": "Dänemark",
              "UICCountryCode": "86",
              "Alphacode": "DK"
            },
            {
              "ISOCode": "ES",
              "Description": "Spanien",
              "UICCountryCode": "71",
              "Alphacode": "E"
            },
            {
              "ISOCode": "EE",
              "Description": "Estland",
              "UICCountryCode": "26",
              "Alphacode": "EST"
            },
            {
              "ISOCode": "FR",
              "Description": "Frankreich",
              "UICCountryCode": "87",
              "Alphacode": "F"
            },
            {
              "ISOCode": "FI",
              "Description": "Finnland",
              "UICCountryCode": "10",
              "Alphacode": "FIN"
            },
            {
              "ISOCode": "GB",
              "Description": "Großbritannien",
              "UICCountryCode": "70",
              "Alphacode": "GB"
            },
            {
              "ISOCode": "GE",
              "Description": "Georgien",
              "UICCountryCode": "28",
              "Alphacode": "GE"
            },
            {
              "ISOCode": "GR",
              "Description": "Griechenland",
              "UICCountryCode": "73",
              "Alphacode": "GR"
            },
            {
              "ISOCode": "HU",
              "Description": "Ungarn",
              "UICCountryCode": "55",
              "Alphacode": "H"
            },
            {
              "ISOCode": "HR",
              "Description": "Kroatien",
              "UICCountryCode": "78",
              "Alphacode": "HR"
            },
            {
              "ISOCode": "IT",
              "Description": "Italien",
              "UICCountryCode": "83",
              "Alphacode": "I"
            },
            {
              "ISOCode": "IR",
              "Description": "Iran",
              "UICCountryCode": "96",
              "Alphacode": "IR"
            },
            {
              "ISOCode": "IE",
              "Description": "Irland",
              "UICCountryCode": "60",
              "Alphacode": "IRL"
            },
            {
              "ISOCode": "IQ",
              "Description": "Irak",
              "UICCountryCode": "99",
              "Alphacode": "IRQ"
            },
            {
              "ISOCode": "KG",
              "Description": "Kirgisistan",
              "UICCountryCode": "59",
              "Alphacode": "KS"
            },
            {
              "ISOCode": "KZ",
              "Description": "Kasachstan",
              "UICCountryCode": "27",
              "Alphacode": "KZ"
            },
            {
              "ISOCode": "LU",
              "Description": "Luxemburg",
              "UICCountryCode": "82",
              "Alphacode": "L"
            },
            {
              "ISOCode": "LT",
              "Description": "Litauen",
              "UICCountryCode": "24",
              "Alphacode": "LT"
            },
            {
              "ISOCode": "LV",
              "Description": "Lettland",
              "UICCountryCode": "25",
              "Alphacode": "LV"
            },
            {
              "ISOCode": "MN",
              "Description": "Mongolei",
              "UICCountryCode": "31",
              "Alphacode": "MGL"
            },
            {
              "ISOCode": "MK",
              "Description": "Mazedonien",
              "UICCountryCode": "65",
              "Alphacode": "MK"
            },
            {
              "ISOCode": "ME",
              "Description": "Montenegro",
              "UICCountryCode": "62",
              "Alphacode": "MNE"
            },
            {
              "ISOCode": "NO",
              "Description": "Norwegen",
              "UICCountryCode": "76",
              "Alphacode": "N"
            },
            {
              "ISOCode": "NL",
              "Description": "Niederlande",
              "UICCountryCode": "84",
              "Alphacode": "NL"
            },
            {
              "ISOCode": "PT",
              "Description": "Portugal",
              "UICCountryCode": "94",
              "Alphacode": "P"
            },
            {
              "ISOCode": "PL",
              "Description": "Polen",
              "UICCountryCode": "51",
              "Alphacode": "PL"
            },
            {
              "ISOCode": "LB",
              "Description": "Libanon",
              "UICCountryCode": "98",
              "Alphacode": "RL"
            },
            {
              "ISOCode": "RO",
              "Description": "Rumänien",
              "UICCountryCode": "53",
              "Alphacode": "RO"
            },
            {
              "ISOCode": "RU",
              "Description": "Rußland",
              "UICCountryCode": "20",
              "Alphacode": "RUS"
            },
            {
              "ISOCode": "SE",
              "Description": "Schweden",
              "UICCountryCode": "74",
              "Alphacode": "S"
            },
            {
              "ISOCode": "SK",
              "Description": "Slowakei",
              "UICCountryCode": "56",
              "Alphacode": "SK"
            },
            {
              "ISOCode": "SI",
              "Description": "Slowenien",
              "UICCountryCode": "79",
              "Alphacode": "SLO"
            },
            {
              "ISOCode": "RS",
              "Description": "Serbien",
              "UICCountryCode": "72",
              "Alphacode": "SRB"
            },
            {
              "ISOCode": "SY",
              "Description": "Syrien",
              "UICCountryCode": "97",
              "Alphacode": "SYR"
            },
            {
              "ISOCode": "CN",
              "Description": "Volksrepublik China",
              "UICCountryCode": "33",
              "Alphacode": "TJ"
            },
            {
              "ISOCode": "TM",
              "Description": "Turkmenistan",
              "UICCountryCode": "67",
              "Alphacode": "TM"
            },
            {
              "ISOCode": "TR",
              "Description": "Türkei",
              "UICCountryCode": "75",
              "Alphacode": "TR"
            },
            {
              "ISOCode": "UA",
              "Description": "Ukraine",
              "UICCountryCode": "22",
              "Alphacode": "UA"
            },
            {
              "ISOCode": "UZ",
              "Description": "Usbekistan",
              "UICCountryCode": "29",
              "Alphacode": "UZ"
            },
            {
              "ISOCode": "VN",
              "Description": "Vietnam",
              "UICCountryCode": "32",
              "Alphacode": "VN"
            }
          ];
          this.dynamicStorageService.storeConfigurationList(RAILORDER_COUNTRY_LISTNAME, countryList);
    }
    private createAuthorityList(): void {

        const authorityList = [
            {
                "BvwNr": 10,
                "Abkuerzung": "VR",
                "EIB": "J",
                "Name": "Finnische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 10,
                "IsoCode": "FI"
            },
            {
                "BvwNr": 20,
                "Abkuerzung": "RZD",
                "EIB": "J",
                "Name": "Russische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 20,
                "IsoCode": "RU"
            },
            {
                "BvwNr": 21,
                "Abkuerzung": "BC",
                "EIB": "J",
                "Name": "Belorussische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 21,
                "IsoCode": "BY"
            },
            {
                "BvwNr": 22,
                "Abkuerzung": "UZ",
                "EIB": "J",
                "Name": "Ukrainische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 22,
                "IsoCode": "UA"
            },
            {
                "BvwNr": 24,
                "Abkuerzung": "LG",
                "EIB": "J",
                "Name": "Litauische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 24,
                "IsoCode": "LT"
            },
            {
                "BvwNr": 25,
                "Abkuerzung": "LDZ",
                "EIB": "N",
                "Name": "Lettische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 25,
                "IsoCode": "LV"
            },
            {
                "BvwNr": 26,
                "Abkuerzung": "EVR",
                "EIB": "N",
                "Name": "Staatlicher Betrieb Estnischer Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 26,
                "IsoCode": "EE"
            },
            {
                "BvwNr": 27,
                "Abkuerzung": "KTZ",
                "EIB": "N",
                "Name": "Kasachische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 27,
                "IsoCode": "KZ"
            },
            {
                "BvwNr": 28,
                "Abkuerzung": "GR",
                "EIB": "N",
                "Name": "Georgische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 28,
                "IsoCode": "GE"
            },
            {
                "BvwNr": 29,
                "Abkuerzung": "UTI",
                "EIB": "N",
                "Name": "Usbekistanische Eisenbahn",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 29,
                "IsoCode": "UZ"
            },
            {
                "BvwNr": 31,
                "Abkuerzung": "MTZ",
                "EIB": "N",
                "Name": "Eisenbahnen der Mongolischen Volksrepublik",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 31,
                "IsoCode": "MN"
            },
            {
                "BvwNr": 32,
                "Abkuerzung": "DSVN",
                "EIB": "N",
                "Name": "Eisenbahnen der Demokratischen Republik Vietnam",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 32,
                "IsoCode": "VN"
            },
            {
                "BvwNr": 33,
                "Abkuerzung": "KZD/CR",
                "EIB": "N",
                "Name": "Eisenbahnen der Chinesischen Volksrepublik",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 33,
                "IsoCode": "CN"
            },
            {
                "BvwNr": 41,
                "Abkuerzung": "HSh",
                "EIB": "J",
                "Name": "Albanische Eisenbahn",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 41,
                "IsoCode": "AL"
            },
            {
                "BvwNr": 44,
                "Abkuerzung": "ZRS",
                "EIB": "J",
                "Name": "Eisenbahnen der Republika Srpska",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 49,
                "IsoCode": "BA"
            },
            {
                "BvwNr": 50,
                "Abkuerzung": "ZFBH",
                "EIB": "J",
                "Name": "Eisenbahnen von Bosnien und Herzegowina",
                "Gueltig ab": "09.01.2003 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 49,
                "IsoCode": "BA"
            },
            {
                "BvwNr": 51,
                "Abkuerzung": "PKP",
                "EIB": "J",
                "Name": "Polnische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 51,
                "IsoCode": "PL"
            },
            {
                "BvwNr": 52,
                "Abkuerzung": "BDZ",
                "EIB": "J",
                "Name": "Bulgarische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 52,
                "IsoCode": "BG"
            },
            {
                "BvwNr": 53,
                "Abkuerzung": "SNCFR",
                "EIB": "J",
                "Name": "Nationale Gesellschaft der Rumänischen Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 53,
                "IsoCode": "RO"
            },
            {
                "BvwNr": 54,
                "Abkuerzung": "CD",
                "EIB": "J",
                "Name": "Tschechische Bahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 54,
                "IsoCode": "CZ"
            },
            {
                "BvwNr": 55,
                "Abkuerzung": "MAV",
                "EIB": "J",
                "Name": "Ungarische Staatseisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 55,
                "IsoCode": "HU"
            },
            {
                "BvwNr": 56,
                "Abkuerzung": "ZSR",
                "EIB": "J",
                "Name": "Eisenbahnen der Slowakischen Republik",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 56,
                "IsoCode": "SK"
            },
            {
                "BvwNr": 57,
                "Abkuerzung": "AZ",
                "EIB": "N",
                "Name": "Aserbaidschanische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 57,
                "IsoCode": "AZ"
            },
            {
                "BvwNr": 59,
                "Abkuerzung": "KRG",
                "EIB": "N",
                "Name": "Kirgisische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 59,
                "IsoCode": "KG"
            },
            {
                "BvwNr": 60,
                "Abkuerzung": "CIE",
                "EIB": "N",
                "Name": "Irische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 60,
                "IsoCode": "IE"
            },
            {
                "BvwNr": 62,
                "Abkuerzung": "ZCG",
                "EIB": "J",
                "Name": "Eisenbahnen von Montenegro",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 62,
                "IsoCode": "ME"
            },
            {
                "BvwNr": 65,
                "Abkuerzung": "CFARYM",
                "EIB": "J",
                "Name": "Eisenbahnen der Republik Mazedonien",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 65,
                "IsoCode": "MK"
            },
            {
                "BvwNr": 67,
                "Abkuerzung": "TRK",
                "EIB": "N",
                "Name": "Turkmenische Eisenbahn",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 67,
                "IsoCode": "TM"
            },
            {
                "BvwNr": 70,
                "Abkuerzung": "BR",
                "EIB": "J",
                "Name": "Britische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 70,
                "IsoCode": "GB"
            },
            {
                "BvwNr": 71,
                "Abkuerzung": "RENFE",
                "EIB": "J",
                "Name": "Nationalverwaltung der Spanischen Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 71,
                "IsoCode": "ES"
            },
            {
                "BvwNr": 72,
                "Abkuerzung": "ZS",
                "EIB": "J",
                "Name": "Eisenbahnen Serbiens",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 72,
                "IsoCode": "RS"
            },
            {
                "BvwNr": 73,
                "Abkuerzung": "CH",
                "EIB": "J",
                "Name": "Hellenische Eisenbahn AG",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 73,
                "IsoCode": "GR"
            },
            {
                "BvwNr": 74,
                "Abkuerzung": "SJ",
                "EIB": "J",
                "Name": "Schwedische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 74,
                "IsoCode": "SE"
            },
            {
                "BvwNr": 75,
                "Abkuerzung": "TCDD",
                "EIB": "J",
                "Name": "Türkische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 75,
                "IsoCode": "TR"
            },
            {
                "BvwNr": 76,
                "Abkuerzung": "NSB",
                "EIB": "J",
                "Name": "Norwegische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 76,
                "IsoCode": "NO"
            },
            {
                "BvwNr": 78,
                "Abkuerzung": "HZ",
                "EIB": "J",
                "Name": "Kroatische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 78,
                "IsoCode": "HR"
            },
            {
                "BvwNr": 79,
                "Abkuerzung": "SZ",
                "EIB": "J",
                "Name": "Slowenische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 79,
                "IsoCode": "SI"
            },
            {
                "BvwNr": 80,
                "Abkuerzung": "DB",
                "EIB": "N",
                "Name": "Deutsche Bahn AG",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 80,
                "IsoCode": "DE"
            },
            {
                "BvwNr": 81,
                "Abkuerzung": "ÖBB",
                "EIB": "J",
                "Name": "Österreichische Bundesbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 81,
                "IsoCode": "AT"
            },
            {
                "BvwNr": 82,
                "Abkuerzung": "CFL",
                "EIB": "J",
                "Name": "Nationale Gesellschaft der Luxemburgischen Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 82,
                "IsoCode": "LU"
            },
            {
                "BvwNr": 83,
                "Abkuerzung": "FS",
                "EIB": "J",
                "Name": "Italienische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 83,
                "IsoCode": "IT"
            },
            {
                "BvwNr": 84,
                "Abkuerzung": "NS",
                "EIB": "J",
                "Name": "Niederländische Eisenbahnen AG",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 84,
                "IsoCode": "NL"
            },
            {
                "BvwNr": 85,
                "Abkuerzung": "SBB/CFF",
                "EIB": "J",
                "Name": "Schweizerische Bundesbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 85,
                "IsoCode": "CH"
            },
            {
                "BvwNr": 86,
                "Abkuerzung": "DSB",
                "EIB": "J",
                "Name": "Dänische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 86,
                "IsoCode": "DK"
            },
            {
                "BvwNr": 87,
                "Abkuerzung": "SNCF",
                "EIB": "J",
                "Name": "Nationale Gesellschaft der Französischen Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 87,
                "IsoCode": "FR"
            },
            {
                "BvwNr": 88,
                "Abkuerzung": "SNCB",
                "EIB": "J",
                "Name": "Nationale Gesellschaft der Belgischen Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 88,
                "IsoCode": "BE"
            },
            {
                "BvwNr": 94,
                "Abkuerzung": "CP",
                "EIB": "N",
                "Name": "Portugiesische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 94,
                "IsoCode": "PT"
            },
            {
                "BvwNr": 96,
                "Abkuerzung": "RAI",
                "EIB": "N",
                "Name": "Iranische Staatsbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 96,
                "IsoCode": "IR"
            },
            {
                "BvwNr": 97,
                "Abkuerzung": "CFS",
                "EIB": "N",
                "Name": "Syrische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 97,
                "IsoCode": "SY"
            },
            {
                "BvwNr": 98,
                "Abkuerzung": "CEL",
                "EIB": "N",
                "Name": "Libanesische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 98,
                "IsoCode": "LB"
            },
            {
                "BvwNr": 99,
                "Abkuerzung": "IRR",
                "EIB": "N",
                "Name": "Irakische Eisenbahnen",
                "Gueltig ab": "01.05.1999 00:00",
                "Gueltig bis": "31.12.2050 00:00",
                "Sprachcode": "stSP",
                "UICCountryCode": 99,
                "IsoCode": "IQ"
            }
        ];

        this.dynamicStorageService.storeConfigurationList(RAILORDER_AUTHORITYLIST_LISTNAME, authorityList)

    }
    /*
        private createRailOrderCoreConfiguration() {
            const keyValuePairList: KeyValuePair[] = [];
    
            // Array of key parts and corresponding suffixes with values
            const keyData = this.getRailOrderCoreConfigurationKeyData();
            // Loop through keyData to generate key-value pairs
            keyData.forEach(({ typeOfTransportCodeKey, productId, value }) => {
                const key = this.buildRailOrderCoreConfigurationKey(typeOfTransportCodeKey, productId);
                const keyValuePair: KeyValuePair = { key, value };
                keyValuePairList.push(keyValuePair);
            });
    
            return keyValuePairList;
        };
    
    */
}