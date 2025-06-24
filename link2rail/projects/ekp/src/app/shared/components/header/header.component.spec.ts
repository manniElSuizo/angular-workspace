import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocaleComponent } from '../locale/locale.component';
import { CustomerSelectComponent } from '../customer-select/customer-select.component';
import { ModalWindows } from '../modal-windows/modal-windows';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,        
        RouterTestingModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [HeaderComponent, LocaleComponent, CustomerSelectComponent],
      providers: [ModalWindows]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should have a member "isMenuOpened" with value "false"', () => {
    expect(component.isMenuOpened).toBeFalse();
  });

  it('Should change isMenuOpened on icon click and on closeMenu call', () => {
    const fnc = spyOn(component, 'closeMenu').and.callThrough();
    const input = fixture.debugElement.nativeElement.querySelector('#hamburger-menu');
    input.click();
    expect(component.isMenuOpened).toBeTrue();
    component.closeMenu();
    expect(component.isMenuOpened).toBeFalse();
    expect(fnc).toHaveBeenCalled();
  })
});
