import { Component,  Inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { Subject } from "rxjs"; 
import { CodeNamePair } from "@src/app/order-management/models/general-order";
import { SelectedAutoCompleteItem } from "@src/app/shared/components/form-dialog/autocomplete/autocomplete.component";
import { AutocompleteModule } from "@src/app/shared/components/form-dialog/autocomplete/autocomplete.module";
import { SharedModule } from "@src/app/shared/shared.module";
import { ApiDangerousGoodResponse, DangerousGoodObject } from "@src/app/trainorder/models/Cargo.model";
import { TrainorderService } from "@src/app/trainorder/services/trainorder.service";

@Component({
  selector: 'app-dangerous-goods-selection-dialog',
  templateUrl: './dgs.component.html',
  styleUrl: './dgs.component.scss',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule, AutocompleteModule]
})
export class DangerousGoodsSelectionDialogComponent {

  private selectedItem: DangerousGoodObject;
  private dangerousGoods: DangerousGoodObject[] = [];

  protected autocompleteFieldName: string = 'unNr';
  protected selectedIndex: number = -1;
  protected formGroup: FormGroup;
  protected currentlyVisableDangerousGoods: DangerousGoodObject[] = [];
  protected currentPage: number = 0;
  protected totalPages: number = 0;
  protected dangerousLawValidTo: string;
  protected autocompleteResultList: CodeNamePair[] = [];

  private inputChange$: Subject<string> = new Subject<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { dangerousLawValidTo: string },
    private dialogRef: MatDialogRef<DangerousGoodsSelectionDialogComponent>,
    private trainorderService: TrainorderService
  ) {
    this.createForm();
    this.dangerousLawValidTo = data.dangerousLawValidTo;
    this.registerForInputChanges(); // Register for input changes
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      [this.autocompleteFieldName]: new FormControl()
    });
  }

  protected requestSelectionListItems(input: string): void {
    this.inputChange$.next(input); // Emit the input value to the Subject
  }

  protected onSelectAutocompleteItem(selectedItem: SelectedAutoCompleteItem): void {
    if (selectedItem?.code?.length === 0) {
      this.dangerousGoods = [];
      this.createCurrentlyVisableDangeousGoods();
    }
    this.selectUnNumber(selectedItem.code);
  }

  private selectUnNumber(input: string): void {
    if (input) {
      this.trainorderService.getDangerousCargo(input).then((result: DangerousGoodObject[]) => {
        this.dangerousGoods = result;
        this.createCurrentlyVisableDangeousGoods();
      }).catch(err => {
        console.error('Error fetching dangerous cargo data', err);
      });
    }
  }

  private registerForInputChanges(): void {
    this.inputChange$.pipe(
      debounceTime(500), // 500ms debounce time
      switchMap(input => {
        return this.trainorderService.getDangerousCargoInfo(input, this.dangerousLawValidTo || null);
      })
    ).subscribe({
      next: (result: ApiDangerousGoodResponse) => {
        this.autocompleteResultList = result.map(item => ({
          code: item.unCode,
          name: item.unDescription
        }));
      },
      error: err => {
        console.error('Error fetching dangerous goods information', err);
      }
    });
  }

  protected previous(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.createCurrentlyVisableDangeousGoods();
    }
  }

  protected next(): void {
    if ((this.currentPage + 1) < this.totalPages) {
      this.currentPage++;
      this.createCurrentlyVisableDangeousGoods();
    }
  }

  protected previousIsActive(): boolean {
    return this.currentPage > 0;
  }

  protected nextIsActive(): boolean {
    return (this.currentPage + 1) < this.totalPages;
  }

  protected cancel(): void {
    this.dialogRef.close(null);
  }

  protected confirm(): void {
    this.dialogRef.close(this.selectedItem);
  }

  private createCurrentlyVisableDangeousGoods(): void {
    const totalItems: number = this.dangerousGoods?.length || 0;
    this.totalPages = Math.floor(totalItems / 4);
    if (totalItems % 4 > 0) this.totalPages++;

    const currentItems: DangerousGoodObject[] = [];
    let position = this.currentPage * 4;
    for (let idx = position; idx < ((this.currentPage + 1) * 4); idx++) {
      if (this.dangerousGoods.at(idx)) {
        currentItems.push(this.dangerousGoods.at(idx));
      }
    }
    this.currentlyVisableDangerousGoods = currentItems;
  }

  protected highlight(idx: number): string {
    if (idx + (this.currentPage * 4) === this.selectedIndex) {
      return 'highlight';
    }
    return '';
  }

  protected selectDangerousGoodItem(idx: number, selectedItem: DangerousGoodObject): void {
    this.selectedItem = selectedItem;
    this.selectedIndex = (this.currentPage * 4 + idx);
  }

  protected trackByFn(index: any, item: any): any {
    return index;
  }
}