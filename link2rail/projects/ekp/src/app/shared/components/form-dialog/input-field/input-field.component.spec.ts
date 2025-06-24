import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { InputFieldComponent } from './input-field.component';
import { InputFieldSettings } from '../form-dialog.model';

describe('InputFieldComponent', () => {
  let component: InputFieldComponent;
  let fixture: ComponentFixture<TestComponentWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TestComponentWrapper, InputFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestComponentWrapper);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: 'input-field-wrapper',
  template: '<app-input-field [settings]="settings"></app-input-field>'
})
class TestComponentWrapper {
  settings: InputFieldSettings = {
    formControlName: '',
    formControl: undefined,
    formGroup: undefined,
    i18n: {
      label: 'a',
      errorText: 'a'
    }
  }
}