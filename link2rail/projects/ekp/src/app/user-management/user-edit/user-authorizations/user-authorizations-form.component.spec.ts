import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAuthorizationsFormComponent } from './user-authorizations-form.component';
import { UserListService } from '../../user-list/user-list.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('WagonKeeperComponent', () => {
  let component: UserAuthorizationsFormComponent;
  let fixture: ComponentFixture<UserAuthorizationsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAuthorizationsFormComponent, HttpClientModule, TranslateModule.forRoot()],
      providers: [UserListService, TranslateService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserAuthorizationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
