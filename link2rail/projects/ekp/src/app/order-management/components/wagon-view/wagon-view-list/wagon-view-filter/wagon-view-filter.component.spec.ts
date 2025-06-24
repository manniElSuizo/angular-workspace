// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MockComponent } from 'ng-mocks';
// import { WagonViewFilterComponent } from './wagon-view-filter.component';
// import { HttpClientModule } from '@angular/common/http';
// import { TranslateModule } from '@ngx-translate/core';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { MultiselectAutocompleteComponent } from '@src/app/form-dialog/multiselect-autocomplete/multiselect-autocomplete.component';
// import { By } from '@angular/platform-browser';
// import { MultiselectAutocompleteComponentFake } from '@src/app/form-dialog/multiselect-autocomplete/fake/multiselect-autocomplete-fake.component';

// describe('WagonViewFilterComponent', () => {
//   let component: WagonViewFilterComponent;
//   let fixture: ComponentFixture<WagonViewFilterComponent>;
//   let multiselect: MultiselectAutocompleteComponent;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [WagonViewFilterComponent, MultiselectAutocompleteComponentFake],
//       imports: [HttpClientModule, TranslateModule.forRoot()],
//       schemas: [NO_ERRORS_SCHEMA],
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(WagonViewFilterComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();

//     const multiselectElement = fixture.debugElement.query(
//       // Original class!
//       By.directive(MultiselectAutocompleteComponentFake)
//     );
//     multiselect = multiselectElement.componentInstance;
//   });

//   it('renders the multiselect', () => {
//     expect(multiselect).toBeTruthy();
//   });

//   // it('should create', () => {
//   //   expect(component).toBeTruthy();
//   // });
// });

