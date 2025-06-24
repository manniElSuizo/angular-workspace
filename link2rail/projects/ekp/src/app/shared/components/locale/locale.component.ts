import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '@src/app/app.service';

/*
      1. priority: language from session storage
      2. priority: selected browser language
      3. priority: fallback -> DEFAULT_LANGUAGE
*/

const DEFAULT_LANGUAGE = 'de';
const FALLBACK_LANGUAGE = 'de';

export interface Language {
  name: string,
  code: string,
  iso: string
}

@Component({
  selector: 'app-locale',
  templateUrl: './locale.component.html',
  styleUrls: ['./locale.component.scss']
})
export class LocaleComponent {
  private USER_LANG_STORAGE_KEY = "USER_LANG_STORAGE_KEY";

  protected availableLanguages: Language[] = [];
  protected formGroup: FormGroup;

  @Output() language = new EventEmitter<string>();

  constructor(private translate: TranslateService, private appService: AppService) {
    this.init();
  }

  private init(): void {
    this.createLanguages();
    this.createForm();
    this.registerForInputChanges();
    this.setLanguage();
    this.translate.setDefaultLang(FALLBACK_LANGUAGE);
  }

  protected change(): void {
    this.setLanguage();
    this.reloadPage();
  }

  private registerForInputChanges(): void {
    this.languageFormControl.valueChanges.subscribe((selectedLanguageCode: string) => {
      localStorage.setItem(this.USER_LANG_STORAGE_KEY, selectedLanguageCode);
      this.translate.use(selectedLanguageCode);
    });
  }

  private setLanguage() {
    let currentlyUsedLanguage: Language = undefined;
    const languageFromLocalStorage: Language = this.getLanguageFromLocalStorage();
    if (languageFromLocalStorage) {
      currentlyUsedLanguage = languageFromLocalStorage;
    } else {
      currentlyUsedLanguage = this.getBrowserLanguage();
    }

    let availableLanguageCodes: string[] = [];
    for (let item of this.availableLanguages) {
      availableLanguageCodes.push(item.code);
    }
    this.translate.addLangs(availableLanguageCodes);
    this.translate.use(currentlyUsedLanguage.code);
    this.languageFormControl.setValue(currentlyUsedLanguage.code);
    this.appService.language = currentlyUsedLanguage;
    this.language.emit(currentlyUsedLanguage.code);
  }

  private getLanguageFromSessionStorage(): Language {
    const languageCodeFromSessionStorage: string = sessionStorage.getItem(this.USER_LANG_STORAGE_KEY);
    const languageFromSessionStorage: Language = this.availableLanguages.find(language => { return language.code === languageCodeFromSessionStorage; });
    if (languageFromSessionStorage) {
      return languageFromSessionStorage;
    }
    return undefined;
  }

  private getLanguageFromLocalStorage(): Language {
    const languageCodeFromLocalStorage: string = localStorage.getItem(this.USER_LANG_STORAGE_KEY);
    const languageFromLocalStorage: Language = this.availableLanguages.find(language => { return language.code === languageCodeFromLocalStorage; });
    if (languageFromLocalStorage) {
      return languageFromLocalStorage;
    }
    return undefined;
  }

  private createLanguages(): void {
    this.availableLanguages.push({ name: 'German', code: 'de', iso: 'de-DE'});
    this.availableLanguages.push({ name: 'English', code: 'en', iso: 'en-EN'});
    this.availableLanguages.push({ name: 'Dutch', code: 'nl', iso: 'nl-NL'});
    this.availableLanguages.push({ name: 'Polish', code: 'pl', iso: 'pl-PL'});
    this.availableLanguages.push({ name: 'France', code: 'fr', iso: 'fr-FR'});
    this.availableLanguages.push({ name: 'Italian', code: 'it', iso: 'it-IT'});
  }

  private createForm(): void {
    this.formGroup = new FormGroup({
      language: new FormControl()
    });
  }

  private getBrowserLanguage(): Language {
    if(navigator.language && navigator.language.length > 0) {
      const locale = navigator.language.split("-");
      if(locale.length) {
        const lang = this.availableLanguages.find(item => { return item.code === locale[0]; });
        if (lang) {
          return lang;
        }
        // else {
        //   console.error('Browserlanguage (' + locale[0] + ') not supported.');
        // }
      }
    }
    // console.error('Language fallback: ', DEFAULT_LANGUAGE);
    return this.availableLanguages.find(item => { return item.code == DEFAULT_LANGUAGE; });
  }

  private reloadPage() {
    document.location.reload();
  }

  getLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang;
  }

  listLanguages(): string[] {
    return this.translate.getLangs();
  }

  protected translateLanguage(lang: string) {
    return this.translate.instant(lang);
  }

  get languageFormControl(): FormControl {
    return this.formGroup.get('language') as FormControl;
  }
}
