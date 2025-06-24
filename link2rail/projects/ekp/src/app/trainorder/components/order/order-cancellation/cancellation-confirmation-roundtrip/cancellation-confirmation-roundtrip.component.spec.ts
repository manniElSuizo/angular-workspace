import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancellationConfirmationRoundtripComponent } from './cancellation-confirmation-roundtrip.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('CancellationConfirmationRoundtripComponent', () => {
  let component: CancellationConfirmationRoundtripComponent;
  let fixture: ComponentFixture<CancellationConfirmationRoundtripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
          { provide: MAT_DIALOG_DATA, useValue: { 'nextTrainToCancel': {trainNumber: '321'} } },
          { provide: MatDialogRef, useValue: { 'nextTrainToCancel': {trainNumber: '321'} }  },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CancellationConfirmationRoundtripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
