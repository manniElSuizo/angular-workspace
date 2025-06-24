import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateTimePipe } from './date-time.pipe';
import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import  localeDe from '@angular/common/locales/de';

describe('DateTimePipe', () => {

  let pipe:DateTimePipe;
  let translate:TranslateService;

  
  beforeEach(async () => {

    registerLocaleData(localeDe);

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [ HttpClientModule, TranslateModule.forRoot()],
      providers: [  
          DateTimePipe,      
        { provide: LOCALE_ID, useValue: 'de-DE' }
      ]  
    })
    .compileComponents();

     pipe = TestBed.inject(DateTimePipe);
  });

  it('create an instance', () => {      
     expect(pipe).toBeTruthy();
  });

  it('should ignore empty values', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('returns Date for default',() => {  
    const specificDate = new Date('2024-08-04T15:16:58'); 
    expect(pipe.transform(specificDate)).toBe('04.08.2024 15:16');
  });

  it('returns Date for HH:MM',() => {
    const format = 'HH:MM';
    const specificDate = new Date('2024-08-04T15:16:58'); 
    expect(pipe.transform(specificDate,format)).toBe('15:16');
  });

  it('returns Date for shortTime',() => {
    const format = 'shortTime';
    const specificDate = new Date('2024-08-04T15:16:58'); 
    expect(pipe.transform(specificDate,format)).toBe('15:16 Shared.Hour-label');
  });

  it('returns Date for shortDate',() => {
    const format = 'shortDate';
    const specificDate = new Date('2024-08-04T15:16:58'); 
    expect(pipe.transform(specificDate,format)).toBe('04.08.2024');
  });

  it('returns Date for separated',() => {
    const format = 'separated';
    const specificDate = new Date('2024-08-04T15:16:58'); 
    expect(pipe.transform(specificDate,format)).toBe('04.08.2024 | 15:16 Shared.Hour-label');
  });



});
