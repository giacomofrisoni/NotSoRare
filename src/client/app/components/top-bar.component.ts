import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../services/user.service';
import { SessionStatus } from '../models/session-status.enum';
import { TranslatorService } from '../services/translator.service';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['../../assets/styles/top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  selectedLanguage: string;
  sessionStatus: SessionStatus = SessionStatus.Unknown;
  avaiableTranslations: Subject<any> = new Subject<any>();

  constructor(private userService: UserService, private translatorService: TranslatorService) {
    this.sessionStatus = SessionStatus.Unknown;
  }

  ngOnInit() {
    this.userService.isLoggedIn().subscribe((resp: any) =>{
      if (resp.loggedIn) {
        this.sessionStatus = SessionStatus.LoggedIn;
      } else {
        this.sessionStatus = SessionStatus.NotLoggedIn;
      }
    }, (errorResp) => {
      console.log("error!");
      console.log(errorResp);
      this.sessionStatus = SessionStatus.NotLoggedIn;
    });

    this.translatorService.getAvaiableTranslations(data => {
      this.avaiableTranslations.next(data);
      this.selectedLanguage = "GB";
      this.translatorService.setCurrentLanguage("GB");
    }, error => {
      console.log("Reading translations was unsuccesfull");
      console.log(error);
    });
  }

}
