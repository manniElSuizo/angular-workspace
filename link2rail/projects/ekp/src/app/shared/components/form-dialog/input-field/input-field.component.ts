import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { InputFieldSettings } from '../form-dialog.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss'
})
export class InputFieldComponent implements OnInit, AfterViewInit {
  @Input() settings: InputFieldSettings;
  @ViewChild('inputField', {static:true}) inputField: ElementRef;

  protected placeholderText: string;
  protected requiredMarker: string = '*';

  private translate: TranslateService = inject(TranslateService);
  private cdref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private id: string;

  ngOnInit(): void {
    this.id = this.settings.id ? this.settings.id : Math.floor(Date.now() / Math.random() * 10000000) + '';
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

  protected errorCondition(): boolean {
    if (typeof this.settings.showErrorCondition !== undefined && this.settings.showErrorCondition) {
      return this.settings.showErrorCondition;
    }

    if(!this.settings.formControl) {
      return false;
    }

    return !(this.settings.formControl?.valid || this.settings.formControl?.disabled);
  }

  protected getName(): string {
    return this.settings.name ? this.settings.name : this.settings.id ? this.settings.id : this.settings.formControlName;
  }

  protected getId(): string {
    return this.id;
  }

  protected doOnChange($event) {
    if(this.settings.onChange) {
      this.settings.onChange($event);
    }
  }

  protected doOnBlur($event) {
    if(this.settings.onBlur) {
      this.settings.onBlur($event);
    }
  }
}
