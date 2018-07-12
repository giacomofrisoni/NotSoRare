import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookiesUtilsService } from './cookies-utils.service';
import { LanguageService } from './language.service';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class DiseaseService {

  constructor(
    private http: HttpClient, 
    private globalUtils: GlobalUtilsService) { 

  }

  searchDisease(disease: string) {
    return this.http.post(`${this.globalUtils.apiPath}/rareDiseases/search/` + this.globalUtils.createLanguageParameter(), {
      text: disease
    },{
      withCredentials: true,
    });
  }
  
  getDisease(diseaseID: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }
}
