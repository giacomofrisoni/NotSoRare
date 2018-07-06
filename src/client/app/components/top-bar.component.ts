import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../services/user.service';
import { SessionStatus } from '../models/session-status.enum';
import { LanguageService } from '../services/language.service';

import { Subject, Subscription } from 'rxjs';
import { CookiesUtilsService } from '../services/cookies-utils.service';
import { Languages } from '../models/languages.enum';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['../../assets/styles/top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  selectedLanguage: string;
  sessionStatus: SessionStatus = SessionStatus.Unknown;
  avaiableTranslations: Subject<any> = new Subject<any>();

 //subLanguageService: Subscription;

  constructor(
    private userService: UserService, 
    private languageService: LanguageService,
    private cookiesUtils: CookiesUtilsService) {

    this.sessionStatus = SessionStatus.Unknown;
  }

  ngOnInit() {
    // Get the login status of the user
    this.userService.getLoggedInStatus().subscribe(status => {
      this.sessionStatus = status;
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

  onLanguageChanged() {
    console.log(this.selectedLanguage);
    this.languageService.setCurrentLanguage(this.selectedLanguage);
    this.cookiesUtils.write(Languages.LanguagesCookieName, this.selectedLanguage);
  }

}
