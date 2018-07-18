import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from "socket.io-client";
import { HttpClient } from '../../../../node_modules/@angular/common/http';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class NotificatorService {

  private url = 'http://127.0.0.1:3000';
  private socket;

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) {
    this.socket = io(this.url);
  }

  registerToNotificator(codUser: number) {
    this.socket.emit("add-user", codUser, (data) => {
      console.log("response from server")
      console.log(data);
    })
  }

  getForumReplyNotifications() {
    let observable = new Observable(observer => {
      this.socket.on('forumReplyNotification', (data) => {
        console.log(data);
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getMessageReportingNotifications() {
    let observable = new Observable(observer => {
      this.socket.on('messageReportedNotification', (data) => {
        console.log(data);
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getUnreadedNotificationsCount(userID: number) {
    return this.http.get(this.globalUtils.apiPath + "/users/" + userID + "/unreadNotificationsCount/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

  getAllNotifications(userID: number) {
    return this.http.get(this.globalUtils.apiPath + "/users/" + userID + "/notifications/" + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

}
