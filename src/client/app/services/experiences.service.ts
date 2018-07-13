import { Injectable } from '@angular/core';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class ExperiencesService {

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) { }

  getAllExperiences(diseaseID: number) {
    diseaseID = 1;
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/experiences/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

  getExperience(diseaseID: number, codUser: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/experiences/" + codUser + "/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }
}
