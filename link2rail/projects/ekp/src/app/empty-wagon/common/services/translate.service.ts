import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TranslateService {
  private translations: { [key: string]: any } = {}; // Container for all translation data
  private currentLang: string = 'en';
  private translationsLoaded = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Loads translation files for the given assets and URLs.
   * @param assets An object containing asset names and their corresponding URLs
   * @param lang The desired language
   */
  loadTranslations(assets: { [key: string]: string }, lang: string): Observable<void> {
    const requests = Object.keys(assets).map((asset) => {
      const url = `${assets[asset]}/${lang}.json`;
      return this.http.get<{ [key: string]: string }>(url).pipe(
          map((data) => ({ asset, data }))
      );
    });

    return forkJoin(requests).pipe(
        map((results) => {
          results.forEach(({ asset, data }) => {
            this.translations[asset] = data;
            console.log("data", data);
            console.log("forkJoin Object.keys(translations)", Object.keys(this.translations))
          });
          this.currentLang = lang;
          this.translationsLoaded.next(true);
        })
    );
  }
  public getAllTranslations(){
    return this.translations;
  }

  /**
   * Retrieves the translation for a specific key from the given asset.
   * @param key The translation key
   * @param asset The asset name from which the translation comes (e.g., 'shared', 'ewd')
   */
  getTranslation(key: string, asset: string): string {

    const value = this.translations[asset]?.[key];
    return value || key;
  }

  /**
   * Returns the current language.
   */
  getCurrentLang(): string {
    return this.currentLang;
  }

  /**
   * Observes whether the translations have been loaded.
   */
  isTranslationsLoaded(): Observable<boolean> {
    return this.translationsLoaded.asObservable();
  }
}

