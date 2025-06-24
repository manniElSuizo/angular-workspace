import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WagonKeeperFormComponent } from './wagon-keeper-form.component';
import { UserListService } from '../../user-list/user-list.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('WagonKeeperComponent', () => {
  let component: WagonKeeperFormComponent;
  let fixture: ComponentFixture<WagonKeeperFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WagonKeeperFormComponent, HttpClientModule, TranslateModule.forRoot()],
      providers: [UserListService, TranslateService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WagonKeeperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
