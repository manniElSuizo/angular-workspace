import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from './shared/components/header/header.component';
import { LocaleComponent } from './shared/components/locale/locale.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CustomerSelectComponent } from './shared/components/customer-select/customer-select.component';
import { ModalWindows } from './shared/components/modal-windows/modal-windows';

describe('AppComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule
      ],
      declarations: [
        AppComponent,
        HeaderComponent,
        LocaleComponent,
        FooterComponent,
        CustomerSelectComponent
      ],
      providers: [ModalWindows]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
