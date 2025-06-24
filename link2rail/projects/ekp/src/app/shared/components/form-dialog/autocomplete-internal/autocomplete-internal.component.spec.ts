import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { AutocompleteInternalComponent } from './autocomplete-internal.component';
import { TemplateSummary } from '@src/app/order-management/models/rail-order-api';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleChange, SimpleChanges } from '@angular/core';

describe('AutocompleteInternalComponent', () => {
  let component: AutocompleteInternalComponent<TemplateSummary>;
  let fixture: ComponentFixture<AutocompleteInternalComponent<TemplateSummary>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule],
      declarations: [AutocompleteInternalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent<AutocompleteInternalComponent<TemplateSummary>>(AutocompleteInternalComponent);
    component = fixture.componentInstance;
    component.autocompleteResultList = [];
    component.controlName = 'field';
    component.formGroup = new FormGroup({ field: new FormControl() });
    component.displayNameTransform = (e) => `(${e.templateNumber}) ${e.templateName}`;
    component.title = 'fieldTitle';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should select item if no other matches', ((done: DoneFn) => {
  it('should select item if no other matches', (() => {
    // component.onSelectItem.subscribe({
    //   next: e => {
    //     expect(e).toEqual({ templateName: 'template1.0', templateNumber: '1' });
    //     done();
    //   }
    // });
    // spyOn(component.onSelectItem, 'emit');
    component.autocompleteResultList = templateSummaries;
    component.ngOnChanges(changesObj);
    const inputField = document.querySelector('input');
    const dataList = document.querySelector('datalist');
    inputField.focus();
    inputField.value = 'template1';
    inputField.dispatchEvent(new Event('input'));
    expect('(1) template1.0').toEqual(inputField.value);
    expect('none').toEqual((document.querySelector("#datalist-field") as HTMLElement).style.display);
    // expect(component.onSelectItem.emit).toHaveBeenCalledTimes(1);
  }));

  // it('should show datalist on focus if list.length less than 200', () => {
  //   component.autocompleteResultList = templateSummaries;
  //   component.ngOnChanges(changesObj);
  //   const inputField = document.querySelector('input');
  //   inputField.focus();
  //   inputField.value = 'templ';
  //   inputField.dispatchEvent(new Event('input'));
  //   const dataList = document.querySelector('datalist');
  //   expect(dataList.options.length).toBe(3);
  //   expect('none').toEqual((document.querySelector("#datalist-field") as HTMLElement).style.display);
  // });
});

export const templateSummaries: TemplateSummary[] = [
  { templateName: 'template1.0', templateNumber: '1' },
  { templateName: 'template2.0', templateNumber: '2' },
  { templateName: 'template3.0', templateNumber: '3' },
];

export const changesObj: SimpleChanges = {
  autocompleteResultList: new SimpleChange([], templateSummaries, true),
};
