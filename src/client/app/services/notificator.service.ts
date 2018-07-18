import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class NotificatorService {

  constructor(private socket: Socket) {

  }

  sendRequest(codUser: number) {
    this.socket.emit("add-user", codUser, (data) => {
      console.log("response from server")
      console.log(data);
    })
  }

  getNotificationsForEvent(event: string) {
    return this.socket.fromEvent(event);
  }

}
