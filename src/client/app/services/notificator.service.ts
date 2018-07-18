import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from "socket.io-client";

@Injectable()
export class NotificatorService {

  private url = 'http://127.0.0.1:3000';
  private socket;

  constructor() {
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

  getAllNotifications(userID: number) {
    return new Observable();
  }

}
