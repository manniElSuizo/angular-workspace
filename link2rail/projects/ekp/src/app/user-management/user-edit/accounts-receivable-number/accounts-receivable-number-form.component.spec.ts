import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsReceivableNumberComponent } from './accounts-receivable-number-form.component';
import { UserListService } from '../../user-list/user-list.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AccountsReceivableNumberComponent', () => {
  let component: AccountsReceivableNumberComponent;
  let fixture: ComponentFixture<AccountsReceivableNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsReceivableNumberComponent, HttpClientModule, TranslateModule.forRoot()],
      providers: [UserListService, TranslateService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountsReceivableNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
