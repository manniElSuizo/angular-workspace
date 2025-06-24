//#region Imports and dependencies
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OrderItem } from '@src/app/trainorder/models/ApiOrders.model';
import { TrainIdentifier, TrainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';
import { OrderTemplateSummary } from '@src/app/trainorder/models/OrderTemplateModels';
import { formatDate } from '@angular/common';
import { WagonSearchSummary, WagonSearchSummaryDetailed } from '@src/app/order-management/components/wagon-view/models/api-wagon-list';
import { TranslateWagonStatusPipe } from '../../pipes/translate-wagon-status.pipe';
import { RailOrderCodeSearchSummary } from '../../../order-management/components/order-code-view/models/ApiRailOrderCode.model';
import { TemplateSummaryView } from '@src/app/empty-wagon/template/models/template-symmary-view';
import { OrderSummaryView } from '@src/app/empty-wagon/order/models/order-summary-view';
import { RailOrderSearchSummary } from '../../../trainorder/models/ApiRailOrder.model';
import { TranslateOrderInternalStatusPipe } from '../../pipes/translate-order-internal-status.pipe';
import { TranslateOrderStatusPipe } from '../../pipes/translate-order-status.pipe';
//#endregion
//#region Constants
export enum ExportType {
    ORDERS_LIST = "orders-list",
    TRAINS_LIST = "trains-list",
    ORDER_TEMPLATE_LIST = "order-template-list"
}
//#endregion
//#region Service Declaration and Constructor
@Injectable({
    providedIn: 'root',
})
export class FileExportService {

    constructor(
        private translate: TranslateService,
        private translateWagonStatus: TranslateWagonStatusPipe,
        private translateRailOrderInternalStatus: TranslateOrderInternalStatusPipe,
        private translateOrderStatus: TranslateOrderStatusPipe,
        @Inject(LOCALE_ID) private locale: string) {
    }
    //#endregion

    //#region Helper Methods
    private getDateTimePrefixForFileName(filename: string): string {
        const currentDate = new Date();

        // Format the current date as YYYYMMDD
        const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');

        // Format the current time as HHMMSS
        const formattedTime = currentDate.toTimeString().slice(0, 8).replace(/:/g, '');

        // Concatenate formatted date, time, and original filename (ExportWagonList.csv as example)
        const formattedFileName = `${formattedDate}_${formattedTime}_${filename}`;

        return formattedFileName;
    }

    private exportToCsv(data: any[], dataObjectHeader: any, fileName: string, exportType: ExportType | null = null) {
        const csv = data.map((row: any) => {
            return Object.keys(dataObjectHeader)
                .map((fieldName) => {
                    if (fieldName == 'trainId') {
                        const trainIdentifier: TrainIdentifier = row['trains'][0];
                        return trainIdentifier.trainId;
                    }
                    if (fieldName == 'wagonNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'trainNumber') {
                        const trainIdentifier: TrainIdentifier = row['trains'][0];
                        return trainIdentifier.trainNumber;
                    }
                    if (fieldName == 'currentTrainNumber') {
                        return row[fieldName];
                    }
                    if (fieldName == 'productionDate') {
                        const trainIdentifier: TrainIdentifier = row['trains'][0];
                        return trainIdentifier.productionDate;
                    }
                    if (fieldName == 'cancellationFee') {
                        if (row['orderStatus'] == 'CANCELED') {
                            return row[fieldName] ? this.translate.instant('yes') : this.translate.instant('no');
                        }
                        return '';
                    }
                    if (fieldName == 'emptyWagon') {
                        return row[fieldName] ? this.translate.instant('no') : this.translate.instant('yes');
                    }
                    if (fieldName == 'suitableForRunning') {
                        return (row[fieldName] == '1' || row[fieldName] == '2' || row[fieldName] == '4' || row[fieldName] == '6') ? this.translate.instant('Wagon-overview.CSV-export.Damage-no-runablity') : ((row[fieldName] == '3' || row[fieldName] == '5') ? this.translate.instant('Wagon-overview.CSV-export.Damage-limited-runablity') : "");
                    }
                    if (fieldName == "lastWagonEventType") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : this.translateWagonStatus.transform(row[fieldName]);
                    }
                    if (fieldName == "orderNumber") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName] + "\t";
                    }
                    if (fieldName == "orderKey") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].orderAuthority.toString() + row[fieldName].orderNumber.toString() + "\t";
                    }
                    if (fieldName == "nhmCodes") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName] + "\t";
                    }
                    if (fieldName == "lastWagonEventTime") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == "plannedDeparture") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == "actualDeparture") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == "plannedArrival") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == "estimatedArrivalTime") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == "actualArrival") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == "shippingTime") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == "operationalMode") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : this.translate.instant(row[fieldName]);
                    }
                    if (fieldName == "delayInMinutes" && !row['actualArrival']) {
                        return null
                    }
                    if (fieldName == 'cancelReasonName') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName] + "\t";
                    }

                    if (fieldName == 'firstTrainNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'currentTrainNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'actualDepartureTime') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == 'actualArrivalTime') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == 'consignorReference') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'consignorSGV') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'consigneeSGV') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'acceptancePointLocationCode') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'acceptancePointCountryCode') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'deliveryPointLocationCode') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'deliveryPointCountryCode') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'nhmCode') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'nhmDescription') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'internationalFreightWagonClass') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'tareWeight') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'weight') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'totalWeight') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'tariffNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'bzaNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'contractNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'orderCode') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'status') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'damageTypeCode') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'damageTypeDescription') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'customerReference') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }

                    if (fieldName == "sendingStation" || fieldName == "receivingStation") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].name == null || row[fieldName].name == 'null' ? row[fieldName] : row[fieldName].name;
                    } else if (Array.isArray(row[fieldName])) {
                        if (row[fieldName].length < 1) return '';
                        return row[fieldName].join(",");
                    } else if (fieldName == 'orderStatus') {
                        if (exportType == ExportType.ORDERS_LIST) {
                            return this.translate.instant(row[fieldName]);
                        }
                        return !row[fieldName] || row[fieldName] != 'CANCELED' ? this.translate.instant('ordered') : this.translate.instant('canceled');
                    }
                    const rowData = JSON.stringify(row[fieldName]);
                    return !rowData || rowData == 'null' ? '' : rowData;
                }).join(';');
        });
        csv.unshift(Object.keys(dataObjectHeader).map(key => dataObjectHeader[key]).join(';'));
        const csvArray = csv.join('\r\n');
        const blob: Blob = new Blob([csvArray], { type: 'text/csv' });
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    private exportToCsvFull(data: any[], dataObjectHeader: any, fileName: string, exportType: ExportType | null = null) {
        const csv = data.map((row: any) => {
            return Object.keys(dataObjectHeader)
                .map((fieldName) => {
                    switch (fieldName) {
                        case 'trainId': {
                            const trainIdentifier: TrainIdentifier = row['trains'][0];
                            return trainIdentifier.trainId;
                        }

                        case 'acceptancePointLocationCode':
                        case 'acceptancePointCountryCode':
                        case 'bzaNumber':
                        case 'consignorReference':
                        case 'consignorSgv':
                        case 'consignorSGV':
                        case 'consigneeSgv':
                        case 'consigneeSGV':
                        case 'contractNumber':
                        case 'currentTrainNumber':
                        case 'customerReference':
                        case 'currentTrainNumber':
                        case 'deliveryPointLocationCode':
                        case 'deliveryPointCountryCode':
                        case 'discountCode':
                        case 'firstTrainNumber':
                        case 'internationalFreightWagonClass':
                        case 'nhmCode':
                        case 'orderCode':
                        case 'orderNumber':
                        case 'sendingStationCountryCode':
                        case 'sendingStationNameCode':
                        case 'receivingStationCountryCode':
                        case 'receivingStationNameCode':
                        case 'status':
                        case 'tareWeight':
                        case 'tariffNumber':
                        case 'templateNumber':
                        case 'totalWeight':
                        case 'weight': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString().trim() ;
                        }

                        case 'damageTypeCodes': {
                            if (Array.isArray(row['damageTypes'])) {
                                return row['damageTypes'].length < 1 ? '' : row['damageTypes'].map(damageType => damageType.code).join(', ');
                            }
                            break;
                        }
                        case 'currentLocation': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString().trim().toUpperCase();
                        }

                        case 'currentLocationCountryCode': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString().trim();
                        }

                        case 'damageTypeDescription': {
                            if (Array.isArray(row['damageTypes'])) {
                                return row['damageTypes'].length < 1 ? '' : row['damageTypes'].map(damageType => damageType.description).join(', ');
                            }
                            break;
                        }

                        case 'wagonNumber': {
                            return row[fieldName] == null || row[fieldName] == 'null'
                                ? ''
                                : Number(`${row[fieldName]}`);


                        }
                        case 'trainNumber': {
                            const trainIdentifier: TrainIdentifier = row['trains'][0];
                            return trainIdentifier.trainNumber;
                        }
                        case 'productionDate': {
                            const trainIdentifier: TrainIdentifier = row['trains'][0];
                            return trainIdentifier.productionDate;
                        }
                        case 'emptyWagon': {
                            return row[fieldName] ? this.translate.instant('no') : this.translate.instant('yes');
                        }
                        case 'suitableForRunning': {
                            return (row[fieldName] == '1' || row[fieldName] == '2' || row[fieldName] == '4' || row[fieldName] == '6')
                                ? this.translate.instant('Wagon-overview.CSV-export.Damage-no-runablity')
                                : (row[fieldName] == '3' || row[fieldName] == '5')
                                    ? this.translate.instant('Wagon-overview.CSV-export.Damage-limited-runablity')
                                    : "";
                        }
                        case 'lastWagonEventType': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : this.translateWagonStatus.transform(row[fieldName]);
                        }
                        case 'orderKey': {
                            if (row[fieldName] == null || row[fieldName] === 'null') return '';
                            const authority = row[fieldName].orderAuthority?.toString() || '';
                            const number = row[fieldName].orderNumber?.toString() || '';
                            const combined = authority + number;

                            // Return a String, not a number
                            return String(combined);
                        }

                        case 'actualArrival':
                        case 'actualArrivalTime':
                        case 'actualDeparture':
                        case 'actualDepartureTime':
                        case 'estimatedArrivalTime':
                        case 'lastWagonEventTime':
                        case 'plannedArrival':
                        case 'plannedDeparture':
                        case 'shippingTime': {
                            if (row[fieldName] == null || row[fieldName] === 'null') {
                                return '';
                            }

                            // If the string contains 'T', parse it into a Date object and format it
                            if (row[fieldName].includes('T')) {
                                return formatDate(new Date(row[fieldName]), 'yyyy-MM-dd H:mm', this.locale);
                            }

                            // Otherwise, handle it as a normal date string or return empty
                            return formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                        }
                        case 'operationalMode': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : this.translate.instant(row[fieldName]);
                        }
                        case 'cancelReasonName': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName];
                        }
                        case 'delayInMinutes': {
                            return row[fieldName] && !row['actualArrival'] ? null : row[fieldName];
                        }
                        case 'sendingStation':
                        case 'sendingStationNameAuthority':
                        case 'receivingStation': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].name || row[fieldName];
                        }

                        case 'zabStatus': {
                            return row[fieldName] == null || row[fieldName] == 'null' ? '' : this.translateOrderStatus.transform(row[fieldName]);
                        }

                        case 'orderStatus': {
                            return exportType === ExportType.ORDERS_LIST
                                ? this.translate.instant(row[fieldName])
                                : (row[fieldName] !== 'CANCELED' ? this.translate.instant('ordered') : this.translate.instant('canceled'));
                        }
                        case 'trains': {
                            return row[fieldName].length < 1 ? '' : row[fieldName].map(train => train.trainNumber).join(',');
                        }

                        case 'nhmDescription': {
                            return row[fieldName] == null || row[fieldName] == 'null' || typeof row[fieldName] !== 'string'
                                ? ''
                                : row[fieldName]
                                    .replace(/;/g, ',')   // Replace all semicolons with commas
                                    .replace(/ü/g, 'ue')   // Replace ü with ue
                                    .replace(/Ü/g, 'Ue')   // Replace Ü with Ue
                                    .replace(/ä/g, 'ae')   // Replace ä with ae
                                    .replace(/Ä/g, 'Ae')   // Replace Ä with Ae
                                    .replace(/ß/g, 'ss')   // Replace ß with ss
                                    .replace(/ö/g, 'oe')   // Replace ö with oe
                                    .replace(/Ö/g, 'Oe');  // Replace Ö with Oe
                        }
                        case 'customerReferences': {
                            return Array.isArray(row[fieldName]) && row[fieldName].length > 0
                                ? row[fieldName].join(' ')
                                : '';
                        }

                        default: {
                            const rowData = JSON.stringify(row[fieldName]);
                            return rowData && rowData !== 'null' ? rowData : '';
                        }
                    }
                })
                .join(';'); // Join each field value with semicolon
        });

        // Add header row with column names (from dataObjectHeader) to the CSV
        csv.unshift(Object.keys(dataObjectHeader).map(key => dataObjectHeader[key]).join(';'));

        const csvArray = csv.join('\r\n');

        // Create a Blob object to represent the CSV data and trigger the download
        const blob: Blob = new Blob([csvArray], { type: 'text/csv' });
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    private exportOMOrderToCsv(data: any[], dataObjectHeader: any, fileName: string, exportType: ExportType | null = null) {
        const csv = data.map((row: any) => {
            return Object.keys(dataObjectHeader)

                .map((fieldName) => {
                    if (fieldName == 'templateNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'orderKey') {
                        return row[fieldName].orderAuthority == null || row[fieldName].orderNumber == null || row[fieldName].orderAuthority == 'null' || row[fieldName].orderNumber == 'null' ? '' : row[fieldName].orderAuthority.toString() + row[fieldName].orderNumber.toString() + "\t";
                    }
                    if (fieldName == 'shippingTime') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == 'railOrderStatus') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : this.translateRailOrderInternalStatus.transform(row[fieldName]);
                    }

                    if (fieldName == 'zabStatus') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : this.translateOrderStatus.transform(row[fieldName]);
                    }

                    if (fieldName == "wagonNumbers") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].length + " ;" + row[fieldName] + " \t";
                    }

                    let rowData = JSON.stringify(row[fieldName]);
                    return !rowData || rowData == 'null' ? '' : rowData;
                })
                .join(';');
        });
        csv.unshift(Object.keys(dataObjectHeader).map(key => dataObjectHeader[key]).join(';'));
        const csvArray = csv.join('\r\n');

        const blob: Blob = new Blob([csvArray], { type: 'text/csv' });
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    private exportOMOrderCodeToCsv(data: RailOrderCodeSearchSummary[], dataObjectHeader: any, fileName: string, exportType: ExportType | null = null) {
        const csv = data.map((row: any) => {
            return Object.keys(dataObjectHeader)

                .map((fieldName) => {
                    if (fieldName == 'templateNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'templateName') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'consignorName') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'sendingStation') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'consigneeName') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'receivingStation') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'nhmDescription') {
                        return row['nhmCode'] == null || row['nhmCode'] == 'null' || row['nhmDescription'] == null || row['nhmDescription'] == 'null' ? '' : row['nhmCode'] + " " + row['nhmDescription'] + "\t";
                    }
                    if (fieldName == 'unDescription') {
                        return row['unCode'] == null || row['unCode'] == 'null' || row['unDescription'] == null || row['unDescription'] == 'null' ? '' : row['unCode'] + " " + row['unDescription'] + "\t";
                    }

                    const rowData = JSON.stringify(row[fieldName]);
                    return !rowData || rowData == 'null' ? '' : rowData;
                })
                .join(';');
        });
        csv.unshift(Object.keys(dataObjectHeader).map(key => dataObjectHeader[key]).join(';'));
        const csvArray = csv.join('\r\n');

        const blob: Blob = new Blob([csvArray], { type: 'text/csv' });
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    private exportEWDOrderOverviewToCsv(data: OrderSummaryView[], dataObjectHeader: any, fileName: string, exportType: ExportType | null = null) {
        const csv = data.map((row: any) => {

            return Object.keys(dataObjectHeader)

                .map((fieldName) => {
                    if (fieldName == 'ordererSgvId') {
                        return row['orderer'] == null || row['orderer'] == 'null' ? '' : (row['orderer'].sgvId == null ? '' : row['orderer'].sgvId?.toString()) + " " + (row['orderer'].sgvName == null ? '' : row['orderer'].sgvName?.toString());
                    }
                    if (fieldName == 'ordererPartnerId') {
                        return row['orderer'] == null || row['orderer'] == 'null' ? '' : (row['orderer'].partnerId == null ? '' : row['orderer'].partnerId?.toString()) + " " + (row['orderer'].partnerName == null ? '' : row['orderer'].partnerName?.toString());
                    }
                    if (fieldName == 'shipperSgvId') {
                        return row['shipper'] == null || row['shipper'] == 'null' ? '' : (row['shipper'].sgvId == null ? '' : row['shipper'].sgvId?.toString()) + " " + (row['shipper'].sgvName == null ? '' : row['shipper'].sgvName?.toString());
                    }
                    if (fieldName == 'shipperPartnerId') {
                        return row['shipper'] == null || row['shipper'] == 'null' ? '' : (row['shipper'].partnerId == null ? '' : row['shipper'].partnerId?.toString()) + " " + (row['shipper'].partnerName == null ? '' : row['shipper'].partnerName?.toString());
                    }
                    if (fieldName == 'demandLocationName') {
                        return row['demandLocation'] == null || row['demandLocation'] == 'null' ? '' : row['demandLocation'].name?.toString();
                    }
                    if (fieldName == 'freightWagonLocation') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : (row[fieldName].number == null ? '' : row[fieldName].number?.toString()) + " " + (row[fieldName].name == null ? '' : row[fieldName].name?.toString());
                    }
                    if (fieldName == 'demandLocationCountryCodeIso') {
                        return row['demandLocation'] == null || row['demandLocation'] == 'null' ? '' : row['demandLocation'].countryCodeIso?.toString();
                    }
                    if (fieldName == 'demandWagonType') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].number?.toString() + " " + row[fieldName].name?.toString();
                    }
                    if (fieldName == 'numberOfWagonsOrdered') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName];
                    }
                    if (fieldName == 'numberOfWagonsDisposed') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName];
                    }
                    if (fieldName == 'status') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName];
                    }
                    if (fieldName == 'origin') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName];
                    }
                    if (fieldName == "deliveryDateTime") {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : formatDate(row[fieldName], 'yyyy-MM-dd H:mm', this.locale);
                    }
                    if (fieldName == 'commentToCustomerService') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName];
                    }
                    if (fieldName == 'customerReference') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName];
                    }
                    if (fieldName == 'countryCodeUic') {
                        return row['loadRunInformation'] == null || row['loadRunInformation'] == 'null' ? '' : row['loadRunInformation'].countryCodeUic?.toString();
                    }
                    if (fieldName == 'locationNumber') {
                        return row['loadRunInformation'] == null || row['loadRunInformation'] == 'null' ? '' : row['loadRunInformation'].locationNumber?.toString();
                    }
                    if (fieldName == 'transitRailwayUndertakingCode') {
                        return row['loadRunInformation'] == null || row['loadRunInformation'] == 'null' ? '' : row['loadRunInformation'].transitRailwayUndertakingCode?.toString();
                    }
                    if (fieldName == 'nhmCode') {
                        return row['loadRunInformation'] == null || row['loadRunInformation'] == 'null' ? '' : row['loadRunInformation'].nhmCode?.toString();
                    }

                    const rowData = JSON.stringify(row[fieldName]);
                    return !rowData || rowData == 'null' ? '' : rowData;
                })
                .join(';');
        });
        csv.unshift(Object.keys(dataObjectHeader).map(key => dataObjectHeader[key]).join(';'));
        const csvArray = csv.join('\r\n');

        const blob: Blob = new Blob([csvArray], { type: 'text/csv' });
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    private exportEWDTemplateOverviewToCsv(data: TemplateSummaryView[], dataObjectHeader: any, fileName: string, exportType: ExportType | null = null) {
        const csv = data.map((row: any) => {
            return Object.keys(dataObjectHeader)

                .map((fieldName) => {
                    if (fieldName == 'templateNumber') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].toString() + "\t";
                    }
                    if (fieldName == 'orderer') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].sgvId?.toString() + " " + row[fieldName].sgvName?.toString() + "\t";
                    }
                    if (fieldName == 'shipper') {
                        return row[fieldName] == null || row[fieldName] == 'null' ? '' : row[fieldName].sgvId?.toString() + " " + row[fieldName].sgvName?.toString() + "\t";
                    }
                    if (fieldName == 'ordererLocation') {
                        return row['orderer'] == null || row['orderer'] == 'null' ? '' : row['orderer'].partnerId?.toString() + " " + row['orderer'].partnerName?.toString() + "\t";
                    }
                    if (fieldName == 'shipperLocation') {
                        return row['shipperLocation'] == null || row['shipperLocation'] == 'null' ? '' : row['shipperLocation'].partnerId?.toString() + " " + row['shipperLocation'].partnerName?.toString() + "\t";
                    }

                    let rowData = JSON.stringify(row[fieldName]);
                    return !rowData || rowData == 'null' ? '' : rowData;
                })
                .join(';');
        });
        csv.unshift(Object.keys(dataObjectHeader).map(key => dataObjectHeader[key]).join(';'));
        const csvArray = csv.join('\r\n');

        const blob: Blob = new Blob([csvArray], { type: 'text/csv' });
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
    //#endregion

    //#region Export Public Methods

    //#region Train Order Export
    public exportTrainsToCsv(data: TrainSummary[]): void {
        // Columns, that are needed in the csv file (we don't take the whole object)
        const dataObjectHeader: any = {
            trainId: this.translate.instant('Order-view-page.Train-id-label'),
            trainNumber: this.translate.instant('Order-view-page.Train-number-label'),
            currentTrainNumber: this.translate.instant('Order-view-page.Current-train-number-label'),
            productionDate: this.translate.instant('Order-view-page.Production-date-label'),
            sendingStation: this.translate.instant('Order-view-p.Shipping-station-label'),
            receivingStation: this.translate.instant('Order-view-page.Receiving-station-label'),
            operationalMode: this.translate.instant('Order-view-page.Operational-mode-label'),
            plannedDeparture: this.translate.instant('Order-view-page.Sending-date-label'),
            actualDeparture: this.translate.instant('Order-view-page.Actual-sending-date-label'),
            plannedArrival: this.translate.instant('Order-view-page.ETA-label'),
            actualArrival: this.translate.instant('Order-view-page.Actual-arrival-label'),
            delayInMinutes: this.translate.instant('Order-view-page.delayInMinutes-label'),
            orderStatus: this.translate.instant('Order-view-page.Train-status-label'),
            cancelReasonName: this.translate.instant('Order-view-page.Train-cancel-label'),
            cancellationFee: this.translate.instant('Order-view-page.cancellationFee-CSV-label')
        };

        this.exportToCsv(data, dataObjectHeader, 'Train_List_Export.csv');
    }

    public exportOrdersToCsv(data: OrderItem[]): void {
        // Columns, that are needed in the csv file (we don't take the whole object)
        const dataObjectHeader: any = {
            customerReference: this.translate.instant('Order-component.Table-header.Customer-reference'),
            orderNumber: this.translate.instant('Order-component.Table-header.Order-number'),
            orderStatus: this.translate.instant('Order-component.Table-header.Order-status'),
            shipmentDate: this.translate.instant('Order-component.Table-header.Shipping-date'),
            sendingStation: this.translate.instant('Order-component.Table-header.Shipping-station'),
            receivingStation: this.translate.instant('Order-component.Table-header.Receiving-station'),
            nhmCodes: this.translate.instant('Order-component.Table-header.NHM-Code'),
            length: this.translate.instant('Order-component.Table-header.Length-in-m-csv'),
            weight: this.translate.instant('Order-component.Table-header.Amount-in-tons')
        };

        this.exportToCsv(data, dataObjectHeader, 'Order_List_Export.csv', ExportType.ORDERS_LIST);
    }

    public exportOrderTemplatesToCsv(data: OrderTemplateSummary[]): void {
        const dataObjectHeader: any = {
            templateId: this.translate.instant('Order-templates-component.Template-nr'),
            trainType: this.translate.instant('Order-templates-component.Train-type'),
            sender: this.translate.instant('Order-templates-component.Sender'),
            sendingStation: this.translate.instant('Order-component.Table-header.Shipping-station'),
            receiver: this.translate.instant('Order-details.Receiver'),
            receivingStation: this.translate.instant('Order-component.Table-header.Receiving-station'),
            validFrom: this.translate.instant('Order-templates-component.Valid-from'),
            validTo: this.translate.instant('Order-templates-component.Valid-to')
        };

        this.exportToCsv(data, dataObjectHeader, 'Order_Templates_List_Export.csv');
    }
    //#endregion

    //#region New Order Export
    public exportRailOrdersToCsv(items: RailOrderSearchSummary[]) {
        const dataObjectHeader: any = {
            templateNumber: this.translate.instant('Order-Management.order-view-list.template-name'),
            orderKey: this.translate.instant('Order-Management.order-view-list.Zab-order-number'),
            shippingTime: this.translate.instant('Order-Management.order-view-list.shippingTime'),
            //railOrderStages: this.translate.instant('Order-Management.order-view-list.railorderstag'),
            //dangerousGoodsTransport: this.translate.instant(''),
            railOrderStatus: this.translate.instant('Order-Management.order-view-list.railOrderStatus'),
            zabStatus: this.translate.instant('Order-Management.order-view-list.status'),
            //railOrderStatusTime: this.translate.instant(''),
            sendingStation: this.translate.instant('Order-Management.order-view-list.sendingStation'),
            receivingStation: this.translate.instant('Order-Management.order-view-list.receivingStation'),
            consignorName: this.translate.instant('Order-Management.order-view-list.consignorName'),
            consigneeName: this.translate.instant('Order-Management.order-view-list.Download-CSV.consigneeName'),
            //templateNumber: this.translate.instant('Order-Management.order-view-list.template-name'),
            wagonNumbers: this.translate.instant('Order-Management.order-view-list.waggonamount'),
            //allowedActions: this.translate.instant(''),
            //authorization: this.translate.instant(''),
        };

        this.exportOMOrderToCsv(items, dataObjectHeader, 'Order_List_Export.csv');
    }

    public exportWagonsToCsv(data: WagonSearchSummary[]): void {
        const dataObjectHeader: any = {
            wagonNumber: this.translate.instant('Wagon-overview.Table-header.Wagon-number'),
            emptyWagon: this.translate.instant('Wagon-overview.CSV-export.Loaded'),
            suitableForRunning: this.translate.instant('Wagon-overview.CSV-export.Runablity'),
            shippingTime: this.translate.instant('Wagon-overview.Table-header.Date-of-dispatch'),
            estimatedArrivalTime: this.translate.instant('Wagon-overview.Table-header.Expected-arrival'),
            sendingStation: this.translate.instant('Wagon-overview.Table-header.Forwarding-yard'),
            receivingStation: this.translate.instant('Wagon-overview.Table-header.Destination-yard'),
            lastWagonEventTime: this.translate.instant('Wagon-overview.CSV-export.Location-time'),
            lastWagonEventType: this.translate.instant('Wagon-overview.CSV-export.Location-status'),
            currentLocation: this.translate.instant('Wagon-overview.Table-header.Location'),
            currentLocationCountryCode: this.translate.instant('Wagon-overview.CSV-export.Location-country'),
            consignorName: this.translate.instant('Wagon-overview.Table-header.Consignor'),
            consigneeName: this.translate.instant('Wagon-overview.CSV-export.Consignee'),
            orderKey: this.translate.instant('Wagon-overview.CSV-export.Zab-order-number'),
        };

        this.exportToCsv(data, dataObjectHeader, 'Wagon_List_Export.csv');
    }

    public exportFullWagonListToCsv(data: WagonSearchSummaryDetailed[]): void {
        const dataObjectHeader: any = {
            wagonNumber: this.translate.instant('Wagon-overview.Table-header.Wagon-number'),
            emptyWagon: this.translate.instant('Wagon-overview.CSV-export.Loaded'),
            suitableForRunning: this.translate.instant('Wagon-overview.CSV-export.Runablity'),
            shippingTime: this.translate.instant('Wagon-overview.Table-header.Date-of-dispatch'),
            estimatedArrivalTime: this.translate.instant('Wagon-overview.Table-header.Expected-arrival'),
            sendingStation: this.translate.instant('Wagon-overview.Table-header.Forwarding-yard'),
            receivingStation: this.translate.instant('Wagon-overview.Table-header.Destination-yard'),
            lastWagonEventTime: this.translate.instant('Wagon-overview.CSV-export.Location-time'),
            lastWagonEventType: this.translate.instant('Wagon-overview.CSV-export.Location-status'),
            currentLocation: this.translate.instant('Wagon-overview.Table-header.Location'),
            currentLocationCountryCode: this.translate.instant('Wagon-overview.CSV-export.Location-country'),
            consignorName: this.translate.instant('Wagon-overview.Table-header.Consignor'),
            consigneeName: this.translate.instant('Wagon-overview.CSV-export.Consignee'),
            orderKey: this.translate.instant('Wagon-overview.CSV-export.Zab-order-number'),
            firstTrainNumber: this.translate.instant('Wagon-overview.CSV-export.First-train-number-label'),
            currentTrainNumber: this.translate.instant('Wagon-overview.CSV-export.Current-train-number-label'),
            actualDepartureTime: this.translate.instant('Wagon-overview.CSV-export.Actual-sending-date-label'),
            actualArrivalTime: this.translate.instant('Wagon-overview.CSV-export.Actual-receiving-date-label'),
            consignorReference: this.translate.instant('Wagon-overview.CSV-export.Annotation-of-consignor-description'),
            consignorSgv: this.translate.instant('Wagon-overview.CSV-export.Sender-customer-number'),
            consigneeSgv: this.translate.instant('Wagon-overview.CSV-export.Receiver-customer-number'),
            sendingStationCode: this.translate.instant('Wagon-overview.CSV-export.Forwarding-yard-number'),
            sendingStationCountryCode: this.translate.instant('Wagon-overview.CSV-export.Sending-country'),
            receivingStationCode: this.translate.instant('Wagon-overview.CSV-export.Receiving-station-number'),
            receivingStationCountryCode: this.translate.instant('Wagon-overview.CSV-export.Receiving-country'),
            nhmCode: this.translate.instant('Wagon-overview.CSV-export.NHM-code-label'),
            nhmDescription: this.translate.instant('Wagon-overview.CSV-export.NHM-code-description'),
            internationalFreightWagonClass: this.translate.instant('Wagon-overview.CSV-export.Wagon-type-label'),
            tareWeight: this.translate.instant('Wagon-overview.CSV-export.Tare-weight'),
            weight: this.translate.instant('Wagon-overview.CSV-export.Netto-weight'),
            totalWeight: this.translate.instant('Wagon-overview.CSV-export.Weight'),
            tariffNumber: this.translate.instant('Wagon-overview.CSV-export.Customs-tariff-no'),
            bzaNumber: this.translate.instant('Wagon-overview.CSV-export.Bza-number'),
            discountCode: this.translate.instant('Wagon-overview.CSV-export.Additional-commercial-information-discount-code'),
            templateNumber: this.translate.instant('Wagon-overview.CSV-export.Template-name'),
            zabStatus: this.translate.instant('Wagon-overview.CSV-export.Status'),
            damageTypeCodes: this.translate.instant('Wagon-overview.CSV-export.Damage-code'),
            damageTypeDescription: this.translate.instant('Wagon-overview.CSV-export.Damage-code-description'),
            customerReferences: this.translate.instant('Wagon-overview.CSV-export.Customer-reference')
        };

        const fileName = this.getDateTimePrefixForFileName('ExportWagonList.csv');
        this.exportToCsvFull(data, dataObjectHeader, fileName); // Use updated file name
    }

    public exportRailOrderCodesToCsv(items: RailOrderCodeSearchSummary[]) {
        const dataObjectHeader: any = {
            templateNumber: this.translate.instant('Order-Management.Order-code-view-list.Download-CSV.Order-code-name-code'),
            templateName: this.translate.instant('Order-Management.Order-code-view-list.Download-CSV.Order-code-name'),
            consignorName: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Consignor-name'),
            sendingStation: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Sending-station'),
            consigneeName: this.translate.instant('Order-Management.Order-code-view-list.Download-CSV.Consignee-name'),
            receivingStation: this.translate.instant('Order-Management.Order-code-view-list.Table-header.Receiving-station'),
            //nhmCode: this.translate.instant(''),
            nhmDescription: this.translate.instant('Order-Management.Order-code-view-list.Table-header.NHM-code-description'),
            //unCode: this.translate.instant(''),
            unDescription: this.translate.instant('Order-Management.Order-code-view-list.Table-header.UN-number-description'),

        };

        this.exportOMOrderCodeToCsv(items, dataObjectHeader, 'Order_Code_List_Export.csv');
    }

    //#endregion

    //#region Empty-wagon Export

    public exportTemplateOverviewToCsv(exportData: TemplateSummaryView[]) {
        const dataObjectHeader: any = {
            templateName: this.translate.instant('ewd.template.overview.table.header.templateName'),
            orderer: this.translate.instant('ewd.template.overview.table.header.ordererSgv'),
            ordererLocation: this.translate.instant('ewd.template.overview.table.header.ordererPartner'),
            shipper: this.translate.instant('ewd.template.overview.table.header.shipperSgv'),
            shipperLocation: this.translate.instant('ewd.template.overview.table.header.shipperPartner'),
        }

        this.exportEWDTemplateOverviewToCsv(exportData, dataObjectHeader, 'TemplateOrder_List_Export.csv');
    }

    public exportOrderOverviewToCsv(exportData: OrderSummaryView[]) {
        const dataObjectHeader: any = {
            orderId: this.translate.instant('ewd.order.overview.table.downloadCsv.orderId'),
            templateName: this.translate.instant('ewd.order.overview.table.downloadCsv.templateName'),
            internalOrderNumber: this.translate.instant('ewd.order.overview.table.downloadCsv.internalOrderNumber'),
            orderIdConsumer: this.translate.instant('ewd.order.overview.table.downloadCsv.orderIdConsumer'),
            ordererSgvId: this.translate.instant('ewd.order.overview.table.downloadCsv.ordererSgvId'),
            ordererPartnerId: this.translate.instant('ewd.order.overview.table.downloadCsv.ordererPartnerId'),
            shipperSgvId: this.translate.instant('ewd.order.overview.table.downloadCsv.shipperSgvId'),
            shipperPartnerId: this.translate.instant('ewd.order.overview.table.downloadCsv.shipperPartnerId'),
            demandLocationName: this.translate.instant('ewd.order.overview.table.header.demandLocation'),
            freightWagonLocation: this.translate.instant('ewd.order.overview.table.downloadCsv.freightWagonLocation'),
            demandLocationCountryCodeIso: this.translate.instant('ewd.order.overview.table.downloadCsv.demandLocationCountry'),
            demandWagonType: this.translate.instant('ewd.order.overview.table.header.demandWagonType'),
            numberOfWagonsOrdered: this.translate.instant('ewd.order.overview.table.downloadCsv.numberOfWagonsOrdered'),
            numberOfWagonsDisposed: this.translate.instant('ewd.order.overview.table.downloadCsv.numberOfWagonsDisposed'),
            status: this.translate.instant('ewd.order.overview.table.header.status'),
            origin: this.translate.instant('ewd.order.overview.table.header.origin'),
            deliveryDateTime: this.translate.instant('ewd.order.overview.table.downloadCsv.demandDateTime'),
            commentToCustomerService: this.translate.instant('ewd.order.overview.table.downloadCsv.customerCommentsToService'),
            customerReference: this.translate.instant('ewd.order.overview.table.header.customerReference'),
            countryCodeUic: this.translate.instant('ewd.order.overview.table.menu.loadRunInformation.countryCodeUic'),
            locationNumber: this.translate.instant('ewd.order.overview.table.menu.loadRunInformation.locationNumber'),
            transitRailwayUndertakingCode: this.translate.instant('ewd.order.overview.table.menu.loadRunInformation.transitRailwayUndertakingCode'),
            nhmCode: this.translate.instant('ewd.order.overview.table.menu.loadRunInformation.nhmCode'),
        }
        this.exportEWDOrderOverviewToCsv(exportData, dataObjectHeader, 'Order_List_Export.csv');
    }
    //#endregion

    //#endregion

    exportToFormattetXlsx(data: any[], dataObjectHeader: any, fileName: string) {

    }
}
