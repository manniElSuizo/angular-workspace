import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericInputComponent } from './numeric-input.component';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputFieldSettings } from '../form-dialog.model';

describe('NumericInputComponent', () => {
  let component: NumericInputComponent;
  let fixture: ComponentFixture<NumericInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      declarations: [NumericInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NumericInputComponent);
    component = fixture.componentInstance;
    component.settings = settings;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call preventDefault on event if letter key down', async () => {
    const letterEvent = new KeyboardEvent("keydown",{
      key: 'i'
    });
    
    const preventDefaultSpy = spyOn(letterEvent, 'preventDefault').and.stub();

    const el = fixture.debugElement.nativeElement.querySelector('input') as HTMLInputElement;
    el.dispatchEvent(letterEvent);
    fixture.detectChanges();
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should NOT call preventDefault on event if digit key down', async () => {
    const digitEvent = new KeyboardEvent("keydown",{
      key: '3'
    });
    
    const preventDefaultSpy = spyOn(digitEvent, 'preventDefault').and.stub();
  
    const el = fixture.debugElement.nativeElement.querySelector('input') as HTMLInputElement;
    el.dispatchEvent(digitEvent);
    fixture.detectChanges();
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should NOT call preventDefault on event with ctrlKey', async () => {
    const ctrKey = new KeyboardEvent("keydown",{
      key: 'Control',
      ctrlKey: true
    });
    
    const preventDefaultSpy = spyOn(ctrKey, 'preventDefault').and.stub();
  
    const el = fixture.debugElement.nativeElement.querySelector('input') as HTMLInputElement;
    el.dispatchEvent(ctrKey);
    fixture.detectChanges();
    
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});

const settings: InputFieldSettings = {
  formControlName: 'inputField',
  formGroup: new FormGroup({inputField: new FormControl()}),
  i18n: {
    label: 'keyLabelText',
    placeholder: 'keyPlaceholderText',
    errorText: 'keyErrorText',
    title: 'keyTitelText'
  }
}
