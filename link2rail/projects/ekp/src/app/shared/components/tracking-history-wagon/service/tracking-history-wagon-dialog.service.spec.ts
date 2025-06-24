/*
import { TestBed } from '@angular/core/testing';
import { TrackingHistoryWagonService } from './trackinghistorywagon.service';
import { ModalWindows } from '../../modal-windows/modal-windows';
import { TrackingHistoryWagonDialogService } from './trackinghistorywagondialog.service';

describe('TrackingHistoryWagonDialogService', () => {
  let service: TrackingHistoryWagonDialogService;
  let trackingHistoryWagonService: jasmine.SpyObj<TrackingHistoryWagonService>;
  let modalWindows: jasmine.SpyObj<ModalWindows>;

  beforeEach(() => {
    const trackingHistoryWagonServiceSpy = jasmine.createSpyObj('TrackingHistoryWagonService', ['showWagonTrackingHistoryDialog']);
    const modalWindowsSpy = jasmine.createSpyObj('ModalWindows', ['open', 'close']);

    TestBed.configureTestingModule({
      providers: [
        TrackingHistoryWagonDialogService,
        { provide: TrackingHistoryWagonService, useValue: trackingHistoryWagonServiceSpy },
        { provide: ModalWindows, useValue: modalWindowsSpy },
      ],
    });

    service = TestBed.inject(TrackingHistoryWagonDialogService);
    trackingHistoryWagonService = TestBed.inject(TrackingHistoryWagonService) as jasmine.SpyObj<TrackingHistoryWagonService>;
    modalWindows = TestBed.inject(ModalWindows) as jasmine.SpyObj<ModalWindows>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
*/