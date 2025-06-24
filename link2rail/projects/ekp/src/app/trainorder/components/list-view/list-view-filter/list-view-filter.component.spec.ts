import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListViewFilterComponent } from './list-view-filter.component';
import { TranslateWagonStatusPipe } from '@src/app/shared/pipes/translate-wagon-status.pipe';

xdescribe('ListViewFilterComponent', () => {
  let component: ListViewFilterComponent;
  let fixture: ComponentFixture<ListViewFilterComponent>;

  beforeEach(() => {
    registerLocaleData(localeDe);
    TestBed.configureTestingModule({
      declarations: [ ListViewFilterComponent ],
      imports: [ HttpClientModule, TranslateModule.forRoot(), MatDialogModule, FormsModule, ReactiveFormsModule],
      providers: [ TranslateWagonStatusPipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListViewFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  })

  it('should create component', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));
});
