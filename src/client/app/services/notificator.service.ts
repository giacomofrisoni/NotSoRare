import { Injectable } from '@angular/core';
import * as io from "socket.io-client";

@Injectable()
export class NotificatorService {

  constructor() {

  }

  sendRequest(codUser: number) {
    io.Socket.emit("add-user", codUser, (data) => {
      console.log("response from server")
      console.log(data);
    })
  }

  getNotificationsForEvent(event: string) {
    return io.Socket.addEventListener(event, (data) => {
      console.log(data);
    });
  }

}
