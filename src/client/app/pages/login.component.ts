import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../services/user.service';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import { SessionStatus } from '../models/session-status.enum';
import { Subscription } from 'rxjs';
import { DivbuttonComponent } from '../components/divbutton.component';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { SimpleDialogComponent } from '../dialogs/simple-dialog.component';
import { SimpleDialogType } from '../dialogs/simple-dialog-type.enum';
import { LanguageService } from '../services/language.service';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/styles/login.component.scss']
})
export class LoginComponent implements OnInit {

  // Components from the view
  @ViewChild('loginButton') loginButton: DivbuttonComponent;
  @ViewChild('checkButton') checkButton: DivbuttonComponent;

  // Binding values
  email: string;
  password: string;
  error: string = "";
  isToVerify: boolean = false;
  verificationCode: string;

  // Subscriptions to unsubscribe on destroy
  subGetLoggedInStatus: Subscription;
  subLogin: Subscription;
  subActivate: Subscription;

  // Translations
  translations: any = {};

  constructor(private userService: UserService, private router: Router, private dialog: MatDialog, private languageService: LanguageService, private translate: TranslateService) { }

  ngOnInit() {
    this.languageService.getCurrentLanguage().subscribe(language =>{
      this.translate.get([
        "Login.AlreadyLoggedIn",
        "Login.LoggedInSuccesfull",
        "Login.RedirectedSoon",
        "Login.LoginError",
        "Login.LoginErrorMessage",
      ]).subscribe((results: any) => {
        for(let key in results) {
          this.translations[key.split(".")[1]] = results[key];
        }
      });
    });

    // Trying to check the login
    this.subGetLoggedInStatus = this.userService.getLoggedInStatus().subscribe(status => {
      // If something was returned
      if (status == SessionStatus.LoggedIn) {
        // Status ok, you're already logged in!
        this.loginIsOk(this.translations.AlreadyLoggedIn, true, $("#login-card"));
      }
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
    this.subLogin = this.userService.login(this.email, this.password).subscribe((resp: any) => {

      //console.log(resp);
      // Set the user ID
      //this.userService.setUserID(resp.codUser);

      // Ok, all is clear
      this.loginIsOk(this.translations.LoggedInSuccesfull + " " + this.translations.RedirectedSoon, true, $("#login-card"));
    }, 
    
    // ERROR or NEED ACTIVATION
    (errorResp) => {
      console.log(errorResp);
      console.log(errorResp.error.inactive);

      // If is inactive, need activation!
      if (errorResp.error.inactive) {
        // Inform that login is OK
        this.loginIsOk(this.translations.LoggedInSuccesfull, false, $("#login-card"));

        // Activate the activation screen
        this.isToVerify = true;
      } 
      // Error
      else {
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
        instance.afterClosed().subscribe(data => {
          
        });
      }

      this.loginButton.icon = "";
    });
  }

  onCodeCheck() {
    //Activate spinner
    this.checkButton.icon = "fa fa-spinner fa-spin";

    // Try to activate the user
    this.subActivate = this.userService.activate(this.email, this.verificationCode).subscribe((resp: any) => {
      // Activation was succesfull
      this.loginIsOk(resp.infoMessage + ". " + this.translations.RedirectedSoon, true, $("#verify-code-card"));
    }, 
    
    (errorResp) => {
      this.checkButton.icon = "";
      console.log(errorResp);
      console.log("Error!");
    });
  }


  private loginIsOk(message: string, isToRedirect: boolean, component: any) {
    // If i want also to redirect to home
    if (isToRedirect) {
      // Reset the login card 
      component.html("<p><i class='fa fa-spinner fa-spin'></i> " + message + "</p>");

      // After 3 seconds
      var timeout = setTimeout(()=>{ 
        // Reset all subscriptions
        this.unsubscribeAll();

        // Navigate to the home page
        this.router.navigate(['./home']);

        // For everyone that watches the login status I'm going to refresh it!
        this.userService.getLoggedInStatus();

        // Stop calling yourself!
        clearTimeout(timeout);
      }, 2000);
    } else {
      // Reset the login card 
      component.html("<p>" + message + "</p>");
    }
  }

  private unsubscribeAll() {
    if (this.subGetLoggedInStatus) this.subGetLoggedInStatus.unsubscribe();
    if (this.subLogin) this.subLogin.unsubscribe();
    if (this.subActivate) this.subActivate.unsubscribe();
  }


  private openDialog(title: string, text: string, type: SimpleDialogType, isAlterEnabled: boolean, mainButtonText: string) {


  }
  

}
