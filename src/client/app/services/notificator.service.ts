import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class NotificatorService {

  constructor(private socket: Socket) {

  }

  getNotificationsForEvent(event: string) {
    return this.socket.fromEvent(event);
  }

}
