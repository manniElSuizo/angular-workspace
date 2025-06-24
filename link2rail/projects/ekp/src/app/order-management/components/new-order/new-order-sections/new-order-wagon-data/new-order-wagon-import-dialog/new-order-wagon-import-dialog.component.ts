import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TableHeader } from '@src/app/shared/models/table';
import { TranslateService } from '@ngx-translate/core';
import { ImportLine } from '../../../models/api-wagon-import';
import { initalWagonInformation, initialGood, RailOrder, WagonInformation } from '@src/app/order-management/models/rail-order-api';
import { BaseValidators } from '../../../validators/base-validations';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { ApiGoodResponse, GoodModel } from '@src/app/trainorder/models/Cargo.model';
import { ErrorSummary } from './new-order-wagon-import-dialog-error-summary';
import { ExternalReference } from '../../../../../models/rail-order-api'
import { NewOrderService } from '../../../service/new-order.service';

interface ImportLineObject {
  wagonNumber: string;
  goodWeight: string;
  additionalDescription: string;
  nhmCode: string;
  loadingStatusText: string;
  mrnSubType: string;
  mrnIdentifier: string;
}


@Component({
  selector: 'app-new-order-wagon-import-dialog',
  templateUrl: './new-order-wagon-import-dialog.component.html',
  styleUrls: ['./new-order-wagon-import-dialog.component.scss']
})

export class NewOrderWagonImportDialogComponent {
  protected tooltipText: string;
  protected railOrder: RailOrder;
  protected tableHeaders: TableHeader[] = [];
  protected importedWagonInformation: ImportLine[] = [];
  protected importForm: FormGroup;
  protected hasAC: boolean;
  protected validNhmDescriptions: GoodModel[];

  private AcFirstWagon: WagonInformation;
  

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { railOrder: RailOrder },
    private dialogRef: MatDialogRef<NewOrderWagonImportDialogComponent>,
    private translate: TranslateService,
    private newOrderService: NewOrderService,
    private fb: FormBuilder,
    private trainorderService: TrainorderService
  ) {
    this.createForm();
    this.createTableHeaders();
    this.railOrder = data.railOrder;

    const templateNumber = this.railOrder?.templateNumber?.toString().trim();
    this.hasAC = !!templateNumber; // Ensures a boolean value

    if (this.hasAC) {
      this.getAcFirstWagonObject(templateNumber);
    }
  }
  protected errorSummary: ErrorSummary = new ErrorSummary();

  private createForm(): void {
    this.importForm = this.fb.group({
      importWagonText: [''],
      wagonInformationList: this.fb.array([])
    });
  }

  private getAcFirstWagonObject(templateNumber: string): void {
    this.newOrderService.getRailOrderTemplateByTemplateNumber(templateNumber).subscribe({
      next: ro => {
        
        this.AcFirstWagon = ro.wagonInformation[0];
  
        // Deleting transportPlanId and referenceId from the main wagon object
        if (this.AcFirstWagon?.transportPlanId) {
          delete this.AcFirstWagon.transportPlanId;
        }
  
        if (this.AcFirstWagon?.referenceId) {
          delete this.AcFirstWagon.referenceId;
        }
  
        // Iterating over goods and deleting referenceId from each good
        this.AcFirstWagon?.goods?.forEach(good => {
          if (good.referenceId) {
            delete good.referenceId;
          }
  
          // Iterating over dangerous goods and deleting referenceId from each one
          good?.dangerousGoods?.forEach(dangerousGood => {
            if (dangerousGood.referenceId) {
              delete dangerousGood.referenceId;
            }
          });
        });
  
      },
      error: e => console.error(e)
    });
  }
  

  private createTableHeaders(): void {
    this.tableHeaders = [
      { fieldName: 'Id', headerText: this.translate.instant('New-order.Wagon-information.Label.Import-wagon-table-id'), minWidth: '3%', maxWidth: '5px', textAlign: 'left', sortable: false },
      { fieldName: 'wagonNumber', headerText: this.translate.instant('New-order.Wagon-information.Label.Wagon-number'), minWidth: '10%', maxWidth: '60px', textAlign: 'left', sortable: false },
      { fieldName: 'weight', headerText: this.translate.instant('New-order.Wagon-information.Label.Weight-kg'), minWidth: '10%', maxWidth: '10%', textAlign: 'left', sortable: false },
      { fieldName: 'additionalDescription', headerText: this.translate.instant('New-order.Wagon-information.Label.Import-wagon-additional-info'), minWidth: '20%', maxWidth: '100px', textAlign: 'left', sortable: false },
      { fieldName: 'firstNhmCodeName', headerText: this.translate.instant('New-order.Wagon-information.Label.Import-wagon-table-first-nhm-and-name'), minWidth: '15%', maxWidth: '80px', textAlign: 'left', sortable: false },
      { fieldName: 'loadingState', headerText: this.translate.instant('New-order.Wagon-information.Label.Import-wagon-loading-status'), minWidth: '10%', maxWidth: '5%', textAlign: 'left', sortable: false },
      { fieldName: 'MrnClass', headerText: this.translate.instant('New-order.Wagon-information.Label.External-reference-subType'), minWidth: '7%', maxWidth: '60px', textAlign: 'left', sortable: false },
      { fieldName: 'MrnNumber', headerText: this.translate.instant('New-order.Wagon-information.Label.External-reference-identifier'), minWidth: '20%', maxWidth: '60px', textAlign: 'left', sortable: false },
      { fieldName: 'importStatus', headerText: '', minWidth: '30px', maxWidth: '30px', textAlign: 'left', sortable: false }
    ];
  }

  private initalImportLine(): ImportLine {
    let wagonInformation: WagonInformation = null;
    if (this.hasAC) {
      wagonInformation = this.AcFirstWagon;
    } else {
      wagonInformation = initalWagonInformation();
    }
    return {
      rowId: null,
      wagon: wagonInformation,
    };
  }

  private parseImportText(): void {
    const text = this.importWagonText.trim();
    if (!text) {
      this.importedWagonInformation = [];
      return;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    this.importedWagonInformation = lines.map((line, index: number) => {
      const rowData: ImportLine = this.parseRow(line, index);
      return rowData;
    });
  }


  private getNhmCodeList(): string {
    const text = this.importWagonText.trim();

    if (!text) {
      return '';
    }

    // Split the text into lines, trimming each line and filtering out empty lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    // Collect all NHM codes
    const nhmCodes = lines.map((line, index: number) => {
      const rowData: ImportLineObject = this.getRawLineValues(line, index);
      return rowData.nhmCode; // Extract the nhmCode from each rowData
    });

    return nhmCodes.filter(code => code !== "").length > 0
      ? nhmCodes.filter(code => code !== "").join(', ')
      : null;

  }

  private getRawLineValues(line: string, index: number): ImportLineObject {
    const values = line.split('\t').map(value => value.trim());
    const importLineObject: ImportLineObject = {
      wagonNumber: values[0] || '',  // rawWagonNumber
      goodWeight: values[1] || '',    // rawGoodWeight
      additionalDescription: values[2] || '',  // additionalDescription
      nhmCode: values[3] || '',       // nhmCode
      loadingStatusText: values[4] || '',  // loadingStatusText
      mrnSubType: values[5] || '',    // rawMrnSubType
      mrnIdentifier: values[6] || ''  // rawMrnIdentifier
    };

    return importLineObject;
  }

  // Function to parse text input into JSON objects
  private parseRow(line: string, index: number): ImportLine {
    const values = line.split('\t').map(value => value.trim());
    let wagon = null;
    let good = null;
    let dg = null;

    if (this.hasAC) {
      wagon = structuredClone(this.AcFirstWagon) ?? initalWagonInformation();
      good = structuredClone(this.AcFirstWagon?.goods?.[0]) ?? initialGood();
      // Delete transportPlanId from the wagon if it exists
      if (wagon?.transportPlanId) {
        delete wagon.transportPlanId;
      }

      // Delete referenceId from the wagon if it exists
      if (wagon?.referenceId) {
        delete wagon.referenceId;
      }

      // Iterate over all goods in the wagon to delete referenceId
      wagon?.goods?.forEach(good => {
        if (good?.referenceId) {
          delete good.referenceId;
        }

        // Iterate over all dangerous goods in each good and delete referenceId
        good?.dangerousGoods?.forEach(dg => {
          if (dg?.referenceId) {
            delete dg.referenceId;
          }
        });
      });

    } else {
      wagon = initalWagonInformation();
      good = initialGood();
    }

    let validationErrors: ValidationErrors = {};

    // Extract values with safe defaults
    const [
      rawWagonNumber = '',
      rawGoodWeight = '',
      additionalDescription = '',
      nhmCode = '',
      loadingStatusText = '',
      rawMrnSubType = '',
      rawMrnIdentifier = ''
    ] = values;

    // Process Wagon Number
    const cleanWagonNumber = rawWagonNumber.replace(/\D/g, '') || '';
    this.validateWagonNumber(rawWagonNumber, String(index));
    wagon.wagonNumber = cleanWagonNumber;

    // Process Good Weight
    if (rawGoodWeight) {
      this.validateGoodWeight(rawGoodWeight, String(index));

      const validWeightPattern = /^(\d+(\.[0-9]{1,2})?|(\d+\,\d{1,2}))$/; // Valid weight regex for 2 decimal places

      const parsedWeight = rawGoodWeight
        .replace(/[^0-9.,]/g, '')      // Remove invalid characters (non-numeric, non-comma, non-dot)
        .replace(',', '.');            // Convert comma to dot for consistent parsing

      // Check if the weight matches the allowed pattern and if it ends with .0 or .00 or ,0 or ,00
      if (validWeightPattern.test(parsedWeight)) {

        // Allow only .0, .00, ,0, ,00 at the end
        const finalWeight = parsedWeight.replace(/(\.0+|,0+)$/, '0');

        // Convert to a number
        let numericWeight = Number(finalWeight);

        if (numericWeight % 1 !== 0 || numericWeight < 0 || isNaN(numericWeight)) {
          numericWeight = null;
        }
        good.weight = numericWeight >= 0 ? numericWeight : null;
      }
    }

    // Process Additional Description
    if (additionalDescription) {
      this.validateAdditionalDescription(additionalDescription, String(index));
      good.additionalDescription = additionalDescription.substring(0, 300);
    }

    // Process NHM Code
    if (this.hasAC) {
      good.nhmCode = this.getFirstGoodNhmCode();
      good.nhmDescription = this.getFirstGoodNhmDescription();
    } else if (nhmCode) {
      const cleanNhmCode = nhmCode.replace(/\D/g, '').trim();
      this.validateNhmCode(nhmCode, String(index));
      if (cleanNhmCode.length === 6) {
        good.nhmCode = cleanNhmCode;
        good.nhmDescription = this.getNhmDescription(nhmCode);
      }
    }

    // Process Loading Status
    if (this.hasAC) {
      wagon.loadingStatus = this.getFirstWagonLoadingStatus();
    } else if (loadingStatusText && loadingStatusText.length > 0) {
      wagon.loadingStatus = this.parseLoadingStatus(loadingStatusText);
      if (wagon.loadingStatus == null) {
        this.saveValidationErrors(String(index), { loadingStatusInvalid: loadingStatusText });
      }
    }

    if (wagon.loadingStatus === false && good?.weight > 0) {
      this.saveValidationErrors(String(index), { weightEmptyWagon: true });
    }

    const mrnReference: ExternalReference | null = this.getWagonExternalMRNReferences(index);
    if (mrnReference) {
      // If MRN reference exists, validate and update it
      this.validateMrn(mrnReference, String(index));

      // Update subType only if rawMrnSubType is provided
      if (rawMrnSubType) {
        mrnReference.subType = rawMrnSubType.padStart(2, '0');
      }
      // Update identifier
      mrnReference.identifier = rawMrnIdentifier;
    } else {
      // If no MRN reference exists, create a new one
      const externalReference = this.createInitialExternalReference();

      externalReference.subType = rawMrnSubType ? rawMrnSubType.padStart(2, '0') : null;
      externalReference.identifier = rawMrnIdentifier;

      this.validateMrn(externalReference, String(index));
      wagon.externalReferences.push(externalReference);
    }

    if (this.hasAC) {
      if (wagon?.goods?.length > 0) {
        wagon.goods[0] = good; // Replace the first good
      } else {
        wagon.goods.push(good); // If no goods exist, add it
      }
    } else {
      wagon.goods.push(good);
    }

    // Add errors if present
    if (Object.keys(validationErrors).length > 0) {
      this.errorSummary.addErrors(String(index), validationErrors);
    }

    return {
      rowId: index,
      wagon: wagon,
      validationErrors: this.errorSummary.getErrors(String(index)) || undefined,
    };
  }


  private saveValidationErrors(rowIndex: string, validationErrors: ValidationErrors) {
    if (Object.keys(validationErrors).length > 0) {
      this.errorSummary.addErrors(String(rowIndex), validationErrors);
    } else {
      //this.errorSummary.removeErrors(String(rowIndex));
    }
  }

  private validateWagonNumber(wagonNumber: string, rowIndex: string) {
    let validationErrors: ValidationErrors = {};

    // Remove non-digit characters
    const cleanWagonNumber = wagonNumber?.replace(/\D/g, '') || '';

    // Check if the wagon number is missing
    if (!wagonNumber || wagonNumber.length === 0) {
      validationErrors = { ...validationErrors, wagonNumberRequired: wagonNumber };
    }

    // Check if wagon number contains non-digit characters or exceeds 12 digits
    if (cleanWagonNumber.length > 0 && cleanWagonNumber.length !== 12) {
      Object.assign(validationErrors, BaseValidators.wagonNumberLengthValidator(cleanWagonNumber));
    } else {

      // Additional validation rules
      Object.assign(validationErrors, {
        ...BaseValidators.wagonNumberLuhnValidator(cleanWagonNumber),
        ...BaseValidators.wagonNumberDuplicateValidator(cleanWagonNumber),
      });
    }
    this.saveValidationErrors(rowIndex, validationErrors);
  }


  private parseLoadingStatus(statusText: string): boolean | null {

    const LOADING_STATUS_MAP: Record<string, boolean> = {
      "0": false, "leer": false, "empty": false, "vide": false, "vuoto": false, "leeg": false, "pusty": false,
      "1": true, "beladen": true, "loaded": true, "chargé": true, "laden": true, "zaladowany": true
    };
    return LOADING_STATUS_MAP[statusText.toLowerCase()] ?? null;
  }

  private validateMrn(externalReference: ExternalReference, rowIndex: string) {
    const validationErrors: ValidationErrors = {};
    if (!this.hasAC) {
      Object.assign(validationErrors, {
        ...BaseValidators.isValidMrnSubtype(externalReference?.subType),
      });
    }
    Object.assign(validationErrors, {
      ...BaseValidators.validateMrnIdentifierByType(externalReference.identifier, externalReference?.subType),
      ...BaseValidators.MrnSubTypeRequiredValidator(externalReference?.identifier, externalReference.subType),
    });
    this.saveValidationErrors(rowIndex, validationErrors)
  }

  private validateGoodWeight(goodWeight: string, rowIndex: string) {
    const validationErrors: ValidationErrors = {};
    if (goodWeight) {
      Object.assign(validationErrors, {
        ...BaseValidators.goodWeightStringIsNumeric(goodWeight),
        ...BaseValidators.stringHasNoDecimal(goodWeight),
      });
    }
    this.saveValidationErrors(rowIndex, validationErrors)
  }

  private validateAdditionalDescription(additionalDescription: string, rowIndex: string) {
    const validationErrors: ValidationErrors = {};
    Object.assign(validationErrors, {
      ...BaseValidators.additionalDescriptionLength(additionalDescription),
    });
    this.saveValidationErrors(rowIndex, validationErrors)
  }

  private validateNhmCode(nhmCodeString: string, rowIndex: string) {
    const validationErrors: ValidationErrors = {};
    const nhmCode = nhmCodeString || null;
    
    // If nhmCode is null or empty, we do not proceed
    if (!nhmCode) {
      return;
    }
  
    // Validate if the code has six digits
    const nhmHasSixNumbersError = BaseValidators.nhmHasSixNumbers(nhmCode);
    if (nhmHasSixNumbersError) {
      validationErrors.nhmHasSixNumbers = nhmHasSixNumbersError; // Add specific validation error
    }
  
    // Validate if the code is a valid NHM code
    const nhmInvalidError = this.isValidNhmCode(nhmCode);
    if (nhmInvalidError) {
      validationErrors.invalidNhmCode = nhmInvalidError; // Add specific validation error
    }
  
    // If there are validation errors, save them
    if (Object.keys(validationErrors).length > 0) {
      this.saveValidationErrors(rowIndex, validationErrors);
    }
  }
  

  private createInitialExternalReference(): ExternalReference {
    return { type: 'MRN', identifier: null, description: '', subType: null };
  }

  private getFirstWagonLoadingStatus(): boolean {
    return !!this.AcFirstWagon?.loadingStatus;

  }

  private getFirstGoodNhmCode(): string | null {
    return this.AcFirstWagon?.goods?.[0]?.nhmCode || null;

  }

  private getFirstGoodNhmDescription(): string | null {
    return this.AcFirstWagon?.goods?.[0]?.nhmDescription || null;
  }

  private getWagonExternalMRNReferences(index: number): ExternalReference | null {
    const externalReferences = this.railOrder?.wagonInformation?.at(index)?.externalReferences;
    if (!externalReferences) return null;
    if (externalReferences) {
      const mrnReference = externalReferences.find(ref => ref.type === 'MRN');
      if (!mrnReference) return null;
      return mrnReference;
    }
    return null;
  }

  private isValidNhmCode(nhmCode: string): ValidationErrors | null{
    
    const cleanNhmCode = nhmCode.replace(/\D/g, '');
    const isNhmCodeValid = this.validNhmDescriptions.some(good => good.nhmCode === cleanNhmCode);
    if (!isNhmCodeValid) {
     return  { invalidNhmCode: nhmCode }
    }
    return null;
  }
  
  private async getValidNhmDescriptions(nhmCodes: string): Promise<GoodModel[]> {
    
    const codes = nhmCodes.split(',').map(code => code.trim())
      .filter(code => code.length === 6 && /^\d{6}$/.test(code)); // Filter for only 6-digit codes

      if (codes.length === 0) {
      return []; // Return an empty array if no valid codes
    }

    const cleanCodes = codes.join(','); 
  
    try {
      const result = await this.trainorderService.getCargoCodes(cleanCodes, 6);
      const finalResults = result.map(good => ({
        nhmCode: good.nhmCode || '',  // Assuming nhmCode is part of the result
        description: good.description || '' // Set description from the result or default to an empty string
      }));
  
      return finalResults;
    } catch (error) {
      console.error("Error fetching NHM descriptions for codes:", codes, error);
      return codes.map(code => ({
        nhmCode: code,  // Include nhmCode
        description: ''  // Default to an empty string if there's an error
      }));
    }
  }
  
  private getNhmDescription(nhmCode: string): string {
    const cleanNhmCode = nhmCode.replace(/\D/g, '');
    
    if (cleanNhmCode) {
      const good = this.validNhmDescriptions.find(item => item.nhmCode === cleanNhmCode);
      if (good) {
        return good.description || ''; 
      }
    }
    
    return '';  
  }
  
  protected hasValidationErrors(rowId: string): boolean {
    return this.errorSummary.rowHasErrors(rowId)
  }

  protected get importWagonText() {
    return this.importForm.get('importWagonText')?.value || '';
  }

  protected get wagonInformationList(): FormArray {
    return this.importForm?.get('wagonInformationList') as FormArray || this.fb.array([]);
  }

  protected getMrnIdentifier(wagon: WagonInformation): string | undefined {
    return wagon?.externalReferences?.find(ref => ref.type === 'MRN')?.identifier;
  }

  protected getMrnSubType(wagon: WagonInformation): string | undefined {
    return wagon?.externalReferences?.find(ref => ref.type === 'MRN')?.subType;
  }

  protected getNhmCode(importLine: ImportLine, index: number) {
    let el = document.getElementById(String(importLine.wagon.goods[0].nhmCode + index));
    if (el) {
      el.innerHTML = `${importLine.wagon.goods[0].nhmCode} ${importLine.wagon.goods[0].nhmDescription}`;
    }
  }

  protected getErrorText(index: number): string {
    const rowId = String(index);
    
    // Fetch the errors if any exist for the row
    const errors = this.hasValidationErrors(rowId) ? this.errorSummary.getErrors(rowId) : {};
    if (Object.keys(errors).length > 0) {
      return this.mapValidationErrors(errors);
    }
    return "";
  }

  private mapValidationErrors(errors: ValidationErrors): string {
    const errorMessages: string[] = [];
    Object.keys(errors).forEach(errorKey => {
      let translationKey = '';
      let translationParams = {}; // Object to store dynamic values

      const errorMappings: { [key: string]: { key: string; params: any } } = {
        wagonCountHigh: { key: 'New-order.Errors.Import-wagoncount-high', params: { value: errors[errorKey] } },
        goodWeightNotNumeric: { key: 'New-order.Errors.Import-weight-numeric', params: { value: errors[errorKey] } },
        decimalPlacesGoodWeight: { key: 'New-order.Errors.Import-weight-decimal', params: { value: errors[errorKey] } },
        invalidChecksum: { key: 'New-order.Errors.Import-wagonnumber-luhn', params: { wagonNumber: errors[errorKey] } },
        ensureValidWagonNumber: { key: 'New-order.Errors.Import-wagonnumber-format', params: { wagonNumber: errors[errorKey] } },
        additionInformationTooLong: { key: 'New-order.Errors.Import-additional-info-length', params: { additionInformation: errors[errorKey] } },
        weightEmptyWagon: { key: 'New-order.Errors.Import-weightWhenEmpty', params: { weight: errors[errorKey] } },
        loadingStatusInvalid: { key: 'New-order.Errors.Import-loadingstate', params: { loadingState: errors[errorKey] } },
        invalidNhmCode: { key: 'New-order.Errors.Import-nhmcode', params: { nhmCode: errors[errorKey] } },
        nhmHasSixNumbers: { key: 'New-order.Errors.Import-nhmcode', params: { nhmCode: errors[errorKey] } },
        duplicateNumber: { key: 'New-order.Errors.Import-wagonnumber-duplicate', params: { wagonNumber: errors[errorKey] } },
        invalidFormatMrn: { key: 'New-order.Errors.Import-mrnnumber-format', params: { mrnNumber: errors[errorKey] } },
        invalidMrnSubtype: { key: 'New-order.Errors.Import-nrm-class', params: { mrnClass: errors[errorKey] } },
        mrnSubTypeRequired: { key: 'New-order.Errors.Import-mrnnumber-missing', params: { mrnNumber: errors[errorKey] } },
      };

      // Check if the error key is in the known error mappings
      if (errorMappings[errorKey]) {
        translationKey = errorMappings[errorKey].key;
        translationParams = errorMappings[errorKey].params;
        errorMessages.push(this.translate.instant(translationKey, translationParams));
      }
    });

    const err = errorMessages.join('\n'); // Return only known errors as a single string
    return errorMessages.length > 0 ? err : null;
  }



  protected deleteImportText() {
    this.importForm.get('importWagonText').reset();
  }

  protected async startImport() {
    this.errorSummary.clear();
    this.validNhmDescriptions = [];
    BaseValidators.clearWagonNumbersSet();
    // Collect NHM Codes from Importlist
    const importNhmCodeList = this.getNhmCodeList();
    if (importNhmCodeList?.length > 0) {
      try {
        // Ensure getValidNhmDescriptions completes before proceeding
        this.validNhmDescriptions = await this.getValidNhmDescriptions(importNhmCodeList);
       // Once getValidNhmDescriptions has completed, call parseImportText
        this.parseImportText();
      } catch (error) {
        console.error("Error fetching valid NHM descriptions:", error);
      }
    } else {
      this.parseImportText();
    }
  }

  protected closeDialog(): void {
    this.dialogRef.close();
  }

  protected confirm(): void {
    const wagonInformationList: WagonInformation[] = this.importedWagonInformation
      .map(line => line.wagon)
      .filter((wagon): wagon is WagonInformation => wagon !== null);
    this.dialogRef.close(wagonInformationList);
  }

  protected hasErrorsOrTooManyRows() {
    return this.errorSummary?.getErrorsArray().length > 0 || this.importedWagonInformation?.length > 99;
  }

  protected addNewLine(item?: ImportLine): void {
    const newItem = item || this.initalImportLine();

    // Check if the wagon has goods and external references
    const goods = newItem.wagon?.goods?.[0];
    const externalReferences = goods?.externalReferences || [];

    // Find the first external reference of type 'MRN'
    let mrnReference = externalReferences.find(ref => ref.type === 'MRN');

    // If no 'MRN' reference exists, create a new one
    if (!mrnReference) {
      mrnReference = { type: 'MRN', identifier: '', description: '', subType: '' };
      externalReferences.push(mrnReference);
    }

    // Set the identifier and description
    mrnReference.identifier = goods?.externalReferences?.[0]?.identifier || '';
    mrnReference.description = goods?.externalReferences?.[0]?.description || '';

    // Create the form group
    const itemGroup: FormGroup = this.fb.group({
      rowId: new FormControl(newItem.rowId),
      wagonNumber: new FormControl(newItem.wagon?.wagonNumber),
      goodWeight: new FormControl(goods?.weight),
      additionalDescription: new FormControl(goods?.additionalDescription),
      nhmCode: new FormControl(goods?.nhmCode),
      loadingStatus: new FormControl(newItem.wagon?.loadingStatus),
      mrnClass: new FormControl(mrnReference.identifier),
      mrnNumber: new FormControl(mrnReference.description),
      validationErrors: new FormControl(newItem.validationErrors),
    });

    // Add the form group to the form array
    this.wagonInformationList.push(itemGroup);
  }
}