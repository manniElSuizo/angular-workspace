import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFieldComponent } from './select-field.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { SelectFieldSettings } from '../form-dialog.model';

describe('SelectFieldComponent', () => {
  let component: SelectFieldComponent;
  let fixture: ComponentFixture<TestComponentWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TestComponentWrapper, SelectFieldComponent]
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
  selector: 'select-field-wrapper',
  template: '<app-select-field [settings]="settings"></app-select-field>'
})
class TestComponentWrapper {
  settings: SelectFieldSettings = {
    options: [],
    optionTransform: undefined,
    formControlName: '',
    formControl: undefined,
    formGroup: undefined,
    i18n: {
      label: 'x',
      errorText: 'x'
    }
  }
}