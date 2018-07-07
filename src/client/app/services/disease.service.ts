import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookiesUtilsService } from './cookies-utils.service';
import { LanguageService } from './language.service';

@Injectable()
export class DiseaseService {

  constructor(
    private http: HttpClient, 
    private cookiesUtils: CookiesUtilsService, 
    private languageService: LanguageService) { 

  }

  searchDisease(disease: string) {
    
  }
}
