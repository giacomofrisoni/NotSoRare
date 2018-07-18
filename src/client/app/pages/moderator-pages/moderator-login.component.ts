import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import * as $ from 'jquery';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DivbuttonComponent } from '../../components/divbutton.component';
import { UserService } from '../../services/user.service';
import { MatDialog, MatDialogConfig } from '../../../../../node_modules/@angular/material';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '../../../../../node_modules/@ngx-translate/core';
import { SimpleDialogType } from '../../dialogs/simple-dialog-type.enum';
import { SimpleDialogComponent } from '../../dialogs/simple-dialog.component';


@Component({
  selector: 'app-login',
  templateUrl: './moderator-login.component.html',
  styleUrls: ['../../../assets/styles/login.component.scss']
})
export class ModeratorLoginComponent implements OnInit {

  // Components from the view
  @ViewChild('loginButton') loginButton: DivbuttonComponent;
  @ViewChild('checkButton') checkButton: DivbuttonComponent;

  // Loading
  isPageLoading = true;

  // Binding values
  email: string;
  password: string;

  // Subscriptions to unsubscribe on destroy
  subGetLoggedInStatus: Subscription;
  subLogin: Subscription;

  // Translations
  translations: any = {};

  constructor(private userService: UserService, private router: Router, private dialog: MatDialog, private languageService: LanguageService, private translate: TranslateService) { }

  ngOnInit() {
    this.languageService.getCurrentLanguage().subscribe(language => {
      this.translate.get([
        "Login.AlreadyLoggedIn",
        "Login.LoggedInSuccesfull",
        "Login.RedirectedSoon",
        "Login.LoginError",
        "Login.LoginErrorMessage",
      ]).subscribe((results: any) => {
        for (let key in results) {
          this.translations[key.split(".")[1]] = results[key];
        }

        // Get the login status of the user
        this.userService.getLoggedInStatus("Login").subscribe((userID: any) => {
          if (userID.loggedIn) {
            // Ok, all is clear
            this.loginIsOk(this.translations.LoggedInSuccesfull + " " + this.translations.RedirectedSoon, true, $("#login-card"));
          }
        });

        this.isPageLoading = false;
      });
    });


  }

  ngOnDestroy() {
    // Reset all subscriptions
    this.unsubscribeAll();
  }


  onLogin() {
    //Set the icon
    this.loginButton.icon = "fa fa-spinner fa-spin";

    // First try to login
    this.subLogin = this.userService.moderatorLogin(this.email, this.password).subscribe((resp: any) => {
      // Ok, all is clear
      this.loginIsOk(this.translations.LoggedInSuccesfull + " " + this.translations.RedirectedSoon, true, $("#login-card"));
    },

      // ERROR
      (errorResp) => {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
          title: this.translations.LoginError,
          text: this.translations.LoginErrorMessage + " - " + errorResp.error.errorMessage,
          type: SimpleDialogType.Error,
          isAlterEnabled: false,
          mainButtonText: "OK",
        };

        let instance = this.dialog.open(SimpleDialogComponent, dialogConfig);
        instance.afterClosed().subscribe(data => { });

        this.loginButton.icon = "";
      });
  }


  private loginIsOk(message: string, isToRedirect: boolean, component: any) {
    // If i want also to redirect to home
    if (isToRedirect) {
      // Reset the login card 
      component.html("<p><i class='fa fa-spinner fa-spin'></i> " + message + "</p>");

      // After 3 seconds
      var timeout = setTimeout(() => {
        // Reset all subscriptions
        this.unsubscribeAll();

        // Navigate to the home page
        this.router.navigate(['./moderatorPage']);

        // For everyone that watches the login status I'm going to refresh it!
        this.userService.getLoggedInStatus("login");

        // Stop calling yourself!
        clearTimeout(timeout);
      }, 2000);
    } else {
      // Reset the login card 
      component.html("<p>" + message + "</p>");
    }

    this.userService.submitLoginChange();
  }


  private unsubscribeAll() {
    if (this.subGetLoggedInStatus) this.subGetLoggedInStatus.unsubscribe();
    if (this.subLogin) this.subLogin.unsubscribe();
  }

}
