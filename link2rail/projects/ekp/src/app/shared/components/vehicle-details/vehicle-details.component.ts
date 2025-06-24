import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Vehicle } from './models/vehicle-details.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.scss'], 
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    TranslateModule
  ]
})
export class VehicleDetailsComponent implements OnInit {
  protected vehicleDetails: Vehicle;
  protected vehicleNumber: string;
  protected browserCultureLang: string;

  protected loadlimitPatternNational: any;
  protected loadlimitPatternInternational: any;
  protected loadlimitPatternNationalHeaderTable: string[][];
  protected loadlimitPatternNationalTable: string[][];
  protected loadlimitPatternInternationalTable: any;
  protected hasNationalLoadlimitPattern : boolean =false;
  protected hasInternationalLoadlimitPattern : boolean = false;
  
  constructor(
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { vehicleDetails: Vehicle | undefined, vehicleNumber: string | undefined }
  ) {
    this.vehicleDetails = data.vehicleDetails ? data.vehicleDetails : null;
    this.vehicleNumber = data.vehicleDetails ? data.vehicleDetails.vehicleNumber : data.vehicleNumber;
    this.browserCultureLang = translate.getBrowserCultureLang();
  }

  ngOnInit(): void {
    if(this.vehicleDetails) {
      this.prepareLoadLimitPattern();
    }
  }
  protected isIntermodalRelevant(){
    if (!this.vehicleDetails.technicalAttributes) return false;
    if (!this.vehicleDetails.technicalAttributes.intermodalRelevant) return false;
    if (this.vehicleDetails.technicalAttributes.intermodalRelevant) return   true;
    return false;
  }


  private prepareLoadLimitPattern() {

    this.sortSpeedLimitsInLineCategories();
    if (!this.vehicleDetails.loadLimitPattern) return;
    this.prepareLoadlimitPatternNational();
    this.prepareLoadlimitPatternInternational();
  }
  // Handling LoadLimits
  private prepareLoadlimitPatternInternational() {
    const loadlimitPatternInternational = this.vehicleDetails.loadLimitPattern.map(pattern => {
      return {
        ...pattern,
        x: pattern.x.filter(_xItem => pattern.countryCode.length !== 0)
      };
    }).filter(pattern => pattern.x.length > 0);
    if (!loadlimitPatternInternational) {
      this.hasInternationalLoadlimitPattern = false;
      return;
    }
    this.hasInternationalLoadlimitPattern = true;
      
    this.getTablePerCountry(loadlimitPatternInternational)

  }
  
  private getTablePerCountry(loadlimitPattern: any[]) {
    this.loadlimitPatternInternationalTable = loadlimitPattern.map((country: { countryCode: any[]; x: {
      speedLimit: any; y: any; 
}[]; }) => ({
      countryCode: country.countryCode[0],
      speedLimit: country.x[0].speedLimit,
      lineCategories: country.x[0].y
    }));
  }

  private prepareLoadlimitPatternNational() {
    const loadlimitPatternNational = this.vehicleDetails.loadLimitPattern.map(pattern => {
      return {
        ...pattern,
        x: pattern.x.filter(xItem => pattern.countryCode.length === 0)
      };
    }).filter(pattern => pattern.x.length > 0);
    if (!loadlimitPatternNational) {
      this.hasNationalLoadlimitPattern = false;
       return;
    }
    this.hasNationalLoadlimitPattern = true;
    this.prepareHeaderLoadlimitPatternNational(loadlimitPatternNational);
    this.prepareTableLoadlimitPatternNational(loadlimitPatternNational);
  }

  private prepareHeaderLoadlimitPatternNational(loadlimitPatternNational: any[]) {
    // Build first two lines of the national nationalLoadLimitPattern
    const speedLimits = loadlimitPatternNational.flatMap((pattern: { x: { speedLimit: any; }[]; }) =>
      pattern.x.map((xItem: { speedLimit: any; }) => xItem.speedLimit)
    );

    const asterisks = loadlimitPatternNational.flatMap((pattern: { x: { asterisks: any; }[]; }) =>
      pattern.x.map((xItem: { asterisks: any; }) => xItem.asterisks || "")
    );

    this.loadlimitPatternNationalHeaderTable = [
      speedLimits,
      asterisks
    ];
  }

  private prepareTableLoadlimitPatternNational(loadlimitPatternNational: any[]) {

    const speedLimits = loadlimitPatternNational.flatMap(pattern =>
      pattern.x.map((xItem: { speedLimit: any; }) => xItem.speedLimit)
    );

    const asterisks = loadlimitPatternNational.flatMap(pattern =>
      pattern.x.map((xItem: { asterisks: any; }) => xItem.asterisks || "")
    );
    const lineCategories: { [key: string]: any[] } = {};
    loadlimitPatternNational.forEach(pattern => {
      pattern.x.forEach((xItem: { y: any[]; }) => {
        xItem.y.forEach((yItem: { lineCategory: string | number; loadLimit: any; }) => {
          if (!lineCategories[yItem.lineCategory]) {
            lineCategories[yItem.lineCategory] = [];
          }
          lineCategories[yItem.lineCategory].push(yItem.loadLimit);
        });
      });
    });

    const table = [
      [ ...speedLimits],
      [ ...asterisks]
    ];

    for (const [lineCategory, loadLimits] of Object.entries(lineCategories)) {
      const hasNonZero = loadLimits.some(limit => limit !== 0);
      table.push([lineCategory, ...loadLimits.map(limit => hasNonZero ? limit : '')]);
    }
    this.loadlimitPatternNationalTable = table;
  }

  private sortSpeedLimitsInLineCategories() {
    if (Array.isArray(this.vehicleDetails.loadLimitPattern)) {
      this.vehicleDetails.loadLimitPattern.forEach(xElement => {
        if (Array.isArray(xElement.x)) {
          xElement.x.forEach(speedLimit => {
            if (Array.isArray(speedLimit.y)) {
              speedLimit.y.sort((a, b) => a.lineCategory.localeCompare(b.lineCategory));
            }
          });
        }
      });
    }
  }

  // Styling
  protected getColumnStyleNationalLoadlimitPatternHeader(index: number, bold: boolean = false) :any {
    const widths =  ['30%', '15%', '15%', '15%', '15%']; 
    const width = widths[index] || 'auto';
    return {
      width: width,
      'font-weight': bold ? 'bold' : 'normal'
    };
  }

  protected getColumnStyleNationalLoadlimitPattenTable(index: number, bold: boolean = false) :any {
    const widths =  ['30%', '15%', '15%', '15%', '15%']; 
    const width = widths[index] || 'auto';
    return {
      width: width,
      'font-weight': bold ? 'bold' : 'normal'
    };
  }


  // Handling Damage-Codes
  protected getDamageDescription(damageType: string): string | null {
    const masterDataCodeType = 'AVVSCHAD';
    const masterDataCodeTranslations = this.vehicleDetails?.masterDataCodeTypes;

    if (!masterDataCodeTranslations) return null;

    // Find the code type entry for 'AVVSCHAD'
    const codeTypeTranslations = masterDataCodeTranslations.find(codeType => codeType.type === masterDataCodeType);
    if (!codeTypeTranslations) return null;

    // Find the specific code entry matching the damageType
    const codeEntry = codeTypeTranslations.codes.find(code => this.extractDigits(code.code) === damageType);
    if (!codeEntry || !codeEntry.descriptions) return null;

    // Try to get the description in the preferred language or fallback to the first available
    const preferredLanguage = this.translate?.currentLang;
    const fallbackLanguage = 'st';

    const preferredLanguageDescriptionEntry = codeEntry.descriptions.find(desc => desc.languageCode === preferredLanguage);
    if (preferredLanguageDescriptionEntry?.longDescription) return preferredLanguageDescriptionEntry.longDescription;

    const fallbackLanguageDescriptionEntry = codeEntry.descriptions.find(desc => desc.languageCode === fallbackLanguage);
    if (fallbackLanguageDescriptionEntry?.longDescription) return fallbackLanguageDescriptionEntry.longDescription;

    const fallback = codeEntry.descriptions[0]; // Fallback to the first available description
    if (fallback?.longDescription) return fallback.longDescription;

    return null;
  }

  protected extractDigits(input: string) {
    // Use a regular expression to match all digits in the input string
    const digits = input.match(/\d+/g);

    // Join the matched digits into a single string and return
    return digits ? digits.join('') : '';
  }

  protected minusOnNoDetailsOrArg(arg: any): any {
    return this.vehicleDetails ? arg : '-';
  }
}