import { AfterViewInit, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { SelectFieldSettings } from '../form-dialog.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss'
})
export class SelectFieldComponent implements OnInit, AfterViewInit {
  @Input() settings: SelectFieldSettings;

  protected fieldName: string;
  protected placeholderText: string;
  protected requiredMarker: string = '*';
  
  private translate: TranslateService = inject(TranslateService);
  private cdref: ChangeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.fieldName = this.settings.name ? this.settings.name : this.settings.id;
  }

  ngAfterViewInit(): void {
    if (this.settings.requiredMarker) {
      this.requiredMarker = this.settings.requiredMarker;
    }
    this.placeholderText = this.translate.instant(this.settings.i18n.label);
    if (this.settings.showRequired) {
      this.placeholderText += this.requiredMarker;
    }
    this.cdref.detectChanges();
  }

  protected displayValue(option: any) {
    return this.settings.optionTransform.transform(option)
  }

  protected errorCondition(): boolean {
    if (typeof this.settings.showErrorCondition !== undefined && this.settings.showErrorCondition) {
      return this.settings.showErrorCondition;
    }

    if(!this.settings.formControl) {
      return false;
    }
    return !(this.settings.formControl?.valid || this.settings.formControl?.disabled);
  }

  protected doOnChange($event) {
    if(this.settings.onChange) {
      this.settings.onChange($event);
    }
  }
}
