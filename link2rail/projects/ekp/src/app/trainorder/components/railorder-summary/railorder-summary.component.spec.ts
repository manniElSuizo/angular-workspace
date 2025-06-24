import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RailorderSummaryComponent } from './railorder-summary.component';
import { WagonNumberPipe } from '@src/app/shared/pipes/wagon-number.pipe';
import { OrderNumberPipe } from '@src/app/shared/pipes/order-number.pipe';
import { DateTimePipe } from '@src/app/shared/pipes/date-time.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TrainorderModule } from '../../trainorder.module';
import { TrainorderService } from '../../services/trainorder.service';
import { mockRailorderSummaryList } from '../../mockup/railorderSummary.mock';
import { SharedPipesModule } from '@src/app/shared/pipes/shared-pipes.module';

describe('RailorderSummaryComponent', () => {
  let component: RailorderSummaryComponent;
  let fixture: ComponentFixture<RailorderSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WagonNumberPipe, OrderNumberPipe, DateTimePipe],
      imports: [
        TranslateModule.forRoot(),
        SharedPipesModule,
        HttpClientModule,
        MatDialogModule,
        TrainorderModule
      ],
      providers: [
        WagonNumberPipe,
        OrderNumberPipe,
        MatDialogModule,
        TrainorderService,
        {
          provide: MAT_DIALOG_DATA, useValue: { railorderSummaryList: mockRailorderSummaryList }
        },
        {
          provide: MatDialogRef, useValue: { railorderSummaryList: mockRailorderSummaryList }
        }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RailorderSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
