import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class ExperiencesService {

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) { }

  getAllExperiences(diseaseID: number, sorting?: string) {
    if (sorting) {
      return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/experiences/" + this.globalUtils.createLanguageParameter() + "&sort=" + sorting, {
        withCredentials: true,
      });
    } else {
      return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/experiences/" + this.globalUtils.createLanguageParameter(), {
        withCredentials: true,
      });
    }
  }

  getExperience(diseaseID: number, codUser: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/experiences/" + codUser + "/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

  addNewExperience(diseaseID: number, userID: number, experienceText: string) {
    return this.http.post(this.globalUtils.apiPath + "/experiences/" + this.globalUtils.createLanguageParameter(), {
      codDisease: diseaseID,
      codUser: userID,
      description: experienceText
    },{
      withCredentials: true,
    });
  }
}
