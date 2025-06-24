import { ChangeDetectorRef, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { InputFieldSettings } from '../form-dialog.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-numeric-input',
  templateUrl: './numeric-input.component.html',
  styleUrl: './numeric-input.component.scss'
})
export class NumericInputComponent {
  @Input() settings: InputFieldSettings;
  @ViewChild('inputField', {static:true}) inputField: ElementRef;

  protected placeholderText: string;
  protected requiredMarker: string = '*';
  protected title: string;

  private translate: TranslateService = inject(TranslateService);
  private cdref: ChangeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.settings.requiredMarker) {
      this.requiredMarker = this.settings.requiredMarker;
    }
    this.placeholderText = this.translate.instant(this.settings.i18n.label);
    if (this.settings.showRequired) {
      this.placeholderText += this.requiredMarker;
    }
    if(this.settings.i18n?.title) {
      this.title = this.settings.i18n.title;
    } else {
      this.title = this.placeholderText;
    }
    this.cdref.detectChanges();
  }

  protected onKeyUpNumberOnly(event: KeyboardEvent): void {
    // const input = event.target as HTMLInputElement;
    // input.value = input.value.replace(/[^0-9]/g, '');
  }

  protected onNumberOnlyKeydown(event: KeyboardEvent): void {
    if(event.ctrlKey) {
      const input = event.target as HTMLInputElement;
      input.value = input.value.replace(/[^0-9]/g, '');
      return;
    }
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const key = event.key;
    if (!/[\d]/.test(key) && !allowedKeys.includes(key)) {
      event.preventDefault();
    }
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
    return this.settings.id ? this.settings.id : this.settings.formControlName;
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

  protected doOnInput($event) {
    if(this.settings.onInput) {
      if(this.settings.onInputArgs && this.settings.onInputArgs.length) {
        this.settings.onInput($event, ...this.settings.onInputArgs);
      } else {
        this.settings.onInput($event);
      }
    }
  }
}
