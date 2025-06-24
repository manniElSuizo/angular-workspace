import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackComponent } from './feedback.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';  // Make sure to import `of` from `rxjs`

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;
  let translateService: TranslateService;
  let dialog: MatDialog;

  beforeEach(async () => {
    const dialogRefMock = {
      afterClosed: jasmine.createSpy().and.returnValue(of({})) // Mocking the dialog's afterClosed observable
    };

    await TestBed.configureTestingModule({
      declarations: [FeedbackComponent],
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule // If you need to make HTTP calls for translations
      ],
      providers: [
        TranslateService,
        { provide: MatDialog, useValue: { open: jasmine.createSpy().and.returnValue(dialogRefMock) } },
        // Provide the mock MatDialogRef
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    dialog = TestBed.inject(MatDialog); 
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy(); // Ensure the component is created
  });

  
});
