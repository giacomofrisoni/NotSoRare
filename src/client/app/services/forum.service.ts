import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class ForumService {

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) { }

  getAllThreads(diseaseID: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/forumThreads/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

  getThread(diseaseID: number, threadID: number) {
    return this.http.get(this.globalUtils.apiPath + "/rareDiseases/" + diseaseID + "/forumThreads/" + threadID + "/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

  postReplyToThread(userID: number, diseaseID: number, threadID: number, message: string) {
    return this.http.post(this.globalUtils.apiPath + "/forumMessages/" + this.globalUtils.createLanguageParameter(), {
      codUser: userID,
      codDisease: diseaseID,
      codForumThread: threadID,
      content: message
    }, {
      withCredentials: true,
    });
  }

  moderateMessage(diseaseID: number, threadID: number, messageID: number) {
    return this.http.post(this.globalUtils.apiPath + "/reports/" + this.globalUtils.createLanguageParameter(), {
      codDisease: diseaseID,
      codForumThread: threadID,
      codForumMessage: messageID
    }, {
      withCredentials: true,
    });
  }
}
