import { Injectable } from '@angular/core';
import { Language } from '../models/language';
import { Http } from '@angular/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class TranslatorService {

  translationsConfig: string[] = ["IT", "PL", "GB"];
  currentLanguage: string;

  constructor(private http: Http) {
  }

  setCurrentLanguage(language: string) {
    this.currentLanguage = language;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
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
    console.log("trying to get");
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
