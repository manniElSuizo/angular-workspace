import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WagonholderListComponent } from './wagonholder-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { DateTimePipe } from '@src/app/shared/pipes/date-time.pipe';

describe('WagonholderListComponent', () => {
  let component: WagonholderListComponent;
  let fixture: ComponentFixture<WagonholderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WagonholderListComponent,DateTimePipe],
      imports : [TranslateModule.forRoot(),HttpClientModule],
      providers: [DateTimePipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WagonholderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
