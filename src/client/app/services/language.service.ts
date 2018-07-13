import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { Http } from '@angular/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Languages } from '../models/languages.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LanguageService {

  translationsConfig: string[] = Object.values(Languages);
  currentLanguage: BehaviorSubject<string>;

  constructor(private http: Http, private translate: TranslateService) {
    this.currentLanguage = new BehaviorSubject(null);
    this.currentLanguage.next(Languages.English);
    this.translate.setDefaultLang(Languages.English);
  }

  setCurrentLanguage(language: string) {
    this.currentLanguage.next(language);
    this.translate.use(language);
  }

  getCurrentLanguage() {
    return this.currentLanguage.asObservable();
  }

  convertToStandardLanguage(language: string) {
    switch(language) {
      case Languages.English: return "en";
      case Languages.Italian: return "it";
      case Languages.Polish:  return "pl";
      default: return "en";
    }
  }

  private getFile() {
    return this.http
      // Get all avaiable languages
      .get("../../assets/countries/countries.json")

      // Map results (or catch error)
      .pipe(
        map((res:any) => res.json()),
        catchError(err => of('Something went wrong: ' + err))
      )
  }

  getAllCountries(onActionDone: Function, onActionFail: Function) {
    this.getFile().subscribe(
      data => {
        // Create temp variable to save results
        var tmpLanguages = new Array();

        // Foreach element you retrive
        data.forEach(element => {
          tmpLanguages.push(Language.convertJsonToLanguage(element));
        });

        onActionDone(tmpLanguages);
      }, 
      
      error => {
        onActionFail(error);
      }
    );
  }

  getAvaiableTranslations(onActionDone: Function, onActionFail: Function) {
    this.getFile().subscribe(
      data => {
        //Create temp structure when store data
        var tmpTranslations = new Array();

        // Foreach element you retrive
        data.forEach(element => {
          // Convert that element to a language
          let language: Language = Language.convertJsonToLanguage(element);

          // If this language is an avaiable one
          if (this.translationsConfig.includes(language.code2Letters.toUpperCase())) {
            // Push it also to the array
            tmpTranslations.push(language);
          }
        });

        onActionDone(tmpTranslations);
      }, 
      
      error => {
        onActionFail(error);
      }
    );
  }

}
