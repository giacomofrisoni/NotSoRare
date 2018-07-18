import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../services/user.service';
import { LanguageService } from '../services/language.service';

import { Subject, Subscription } from 'rxjs';
import { CookiesUtilsService } from '../services/cookies-utils.service';
import { Languages } from '../models/languages.enum';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '../../../../node_modules/@angular/router';
import { Location } from '../../../../node_modules/@angular/common';
import { NotificatorService } from '../services/notificator.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['../../assets/styles/top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  // Binding variables
  selectedLanguage: string;
  isUserLoggedIn: boolean = false;
  isUserNotLoggedIn: boolean = false;
  avaiableTranslations: Subject<any> = new Subject<any>();

  userID: number;

  constructor(
    private userService: UserService, 
    private languageService: LanguageService,
    private cookiesUtils: CookiesUtilsService,
    private location: Location,
    private router: Router,
    private notificator: NotificatorService) {
  }

  ngOnInit() {
    this.getLoginStatus();

    this.userService.getWatcherOfLoginChange().subscribe(refreshedStatus => {
      this.getLoginStatus();
    });

    // Take the translation
    this.languageService.getAvaiableTranslations(data => {
      // Ok, I have all translations avaiable
      this.avaiableTranslations.next(data);

      // Get my preference from the cookie!
      let cookieRead = this.cookiesUtils.read(Languages.LanguagesCookieName);

      // Set the language from the cookie, if it's not undefined
      if (cookieRead) {
        this.selectedLanguage = cookieRead;
        this.languageService.setCurrentLanguage(cookieRead);
        this.cookiesUtils.write(Languages.LanguagesCookieName, cookieRead);
      } else {
        this.selectedLanguage = Languages.English;
        this.languageService.setCurrentLanguage(Languages.English);
        this.cookiesUtils.write(Languages.LanguagesCookieName, Languages.English);
      }
    }, error => {
      console.log("Reading translations was unsuccesfull");
      console.log(error);
    });
  }

  private getLoginStatus() {
    this.userService.getLoggedInStatus("TopBar").subscribe((userID: any) => {
      this.isUserLoggedIn = userID.loggedIn ? true : false;
      this.isUserNotLoggedIn = !this.isUserLoggedIn;
      this.userID = userID.loggedIn;

      if (this.isUserLoggedIn) {
        this.notificator.sendRequest(userID.loggedIn);

        /*
        this.notificator.getNotificationsForEvent("add-user").subscribe(data => {
          console.log("add user");
          console.log(data);
        }, error => {
          console.log("add user");
          console.log(error);
        });

        this.notificator.getNotificationsForEvent("forumReplyNotification").subscribe(data => {
          console.log("froum");
          console.log(data);
        }, error => {
          console.log("froum");
          console.log(error);
        });*/
      }
    });
  }

  onLanguageChanged() {
    this.languageService.setCurrentLanguage(this.selectedLanguage);
    this.cookiesUtils.write(Languages.LanguagesCookieName, this.selectedLanguage);
  }

  onUserClick() {
    //this.router.navigate(['/profile', this.userID]);
    this.location.go("/profile/" + this.userID);
    window.location.reload();
  }

}
