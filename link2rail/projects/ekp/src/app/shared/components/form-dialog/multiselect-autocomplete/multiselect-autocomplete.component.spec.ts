import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectAutocompleteComponent, MultiselectAutocompleteParameters } from './multiselect-autocomplete.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

describe('MultiselectAutocompleteComponent', () => {
  let component: MultiselectAutocompleteComponent;
  let fixture: ComponentFixture<TestComponentWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponentWrapper, MultiselectAutocompleteComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [TranslateModule.forRoot(), ],
      // imports: [MultiselectAutocompleteComponent]
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
  selector: 'test-component-wrapper',
  template: '<app-multiselect-autocomplete [multiselectAutocompleteParameters]="multiselectAutocompleteParameters"></app-multiselect-autocomplete>'
})
class TestComponentWrapper {
  multiselectAutocompleteParameters: MultiselectAutocompleteParameters = {
    dataCallback: () => console.log("callback called"),
    divId: "div-id",
    fieldId: "field",
    fieldName: "field",
    formControlName: "field",
    i18n: {
      errorText: "error",
      fieldText: "text",
      labelText: "label"
    },
    selectedItems: []
  };
}