import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WagonViewListComponent } from './wagon-view-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ModalWindows } from '@src/app/shared/components/modal-windows/modal-windows';

describe('WagonViewListComponent', () => {
  let component: WagonViewListComponent;
  let fixture: ComponentFixture<WagonViewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WagonViewListComponent],
      imports: [TranslateModule.forRoot(), HttpClientModule],
      providers: [ModalWindows],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WagonViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
