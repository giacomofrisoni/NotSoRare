import { Injectable } from '@angular/core';
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class ForumService {

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) { }

  getAllThreads(diseaseID: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/forumThreads/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

  getThread(diseaseID: number, threadID) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/forumThreads/" + threadID + "/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }
}
