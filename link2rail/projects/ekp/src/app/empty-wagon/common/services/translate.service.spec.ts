import { TestBed } from '@angular/core/testing';

import { TranslateService } from './translate.service';
import {HttpClient, HttpHandler} from "@angular/common/http";
import {of} from "rxjs";

describe('TranslateService', () => {
  let service: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
          providers: [TranslateService, HttpClient, HttpHandler]
        },
    );
    service = TestBed.inject(TranslateService);
  });

  // loadTranslations successfully loads translation files for given assets and language
  it('should load translations and update state when assets are provided', (done) => {
    const http = TestBed.inject(HttpClient);
    const service = TestBed.inject(TranslateService);
    const assets = {
      ewd: '/assets/i18n/ewd'
    };
    const mockResponse = {
      hello: 'Bonjour',
      goodbye: 'Au revoir'
    };

    spyOn(http, 'get').and.returnValue(of(mockResponse));

    service.loadTranslations(assets, 'fr').subscribe(() => {
      expect(service.getCurrentLang()).toBe('fr');

      const helloTranslation = service.getTranslation('hello', 'ewd');
      const goodbyeTranslation = service.getTranslation('goodbye', 'ewd');

      expect(helloTranslation).toBe('Bonjour');
      expect(goodbyeTranslation).toBe('Au revoir');

      service.isTranslationsLoaded().subscribe(loaded => {
        expect(loaded).toBe(true);
        done();
      });
    });
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
