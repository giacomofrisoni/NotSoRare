import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class ExpertCentresService {

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) { }

  getAllExpertCentres(diseaseID: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/expertCentres/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }
}
