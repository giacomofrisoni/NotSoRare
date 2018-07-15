import { Injectable } from '@angular/core';

@Injectable()
export class CookiesUtilsService {

  constructor() { }

  static LANGUAGE_COOKIE: string = "language";
  static USER_ID_COOKIE: string = "user";

  read(name: string) {
    let result = new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)').exec(document.cookie);
    return result ? result[1] : null;
  }

  write(name: string, value: string, days?: number) {
    if (!days) {
        days = 365 * 2;
    }
    
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    
    let expires = "; expires=" + date.toUTCString();
    
    document.cookie = name + "=" + value + expires + "; path=/";
  }

  remove(name: string) {
    this.write(name, "", -1);
  }
}
