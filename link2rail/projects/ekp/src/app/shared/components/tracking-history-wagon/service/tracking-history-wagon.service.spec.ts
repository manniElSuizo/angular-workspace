import { TestBed } from '@angular/core/testing';
import { TrackingHistoryWagonService } from './tracking-history-wagon.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvService } from '@src/app/shared/services/env/env.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';

describe('TrackingHistoryWagonService', () => {
  let service: TrackingHistoryWagonService;
  let envService: jasmine.SpyObj<EnvService>;
  let localStorageService: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    const envServiceSpy = jasmine.createSpyObj('EnvService', ["backendUrlOm", "backendUrl"]);
    envServiceSpy.backendUrl.and.returnValue('');
    const localStorageServiceSpy = jasmine.createSpyObj('LocalStorageService', ['getItem', 'setItem']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TrackingHistoryWagonService,
        { provide: EnvService, useValue: envServiceSpy },
        { provide: LocalStorageService, useValue: localStorageServiceSpy },
      ],
    });

    service = TestBed.inject(TrackingHistoryWagonService);
    envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;
    localStorageService = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Additional tests can be added here
});
