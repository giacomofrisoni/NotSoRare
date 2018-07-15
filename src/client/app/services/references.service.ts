import { Injectable } from '@angular/core';
import { GlobalUtilsService } from './global-utils.service';
import { HttpClient } from '../../../../node_modules/@angular/common/http';

@Injectable()
export class ReferencesService {

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) { }

  getAllReferences(diseaseID: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/references/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }
}
