import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../services/user.service';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import { SessionStatus } from '../models/session-status.enum';
import { Subscription } from 'rxjs';
import { DivbuttonComponent } from '../components/divbutton.component';

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

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    // Trying to check the login
    this.subGetLoggedInStatus = this.userService.getLoggedInStatus().subscribe(status => {
      // If something was returned
      if (status == SessionStatus.LoggedIn) {
        // Status ok, you're already logged in!
        this.loginIsOk("Login già effettuato, verrai reindirizzato tra poco!", true, $("#login-card"));
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
      // Ok, all is clear
      this.loginIsOk("Login effettuato con successo! Verrai reindirizzato tra poco", true, $("#login-card"));
    }, 
    
    // ERROR or NEED ACTIVATION
    (errorResp) => {
      console.log(errorResp);
      console.log(errorResp.error.inactive);

      // If is inactive, need activation!
      if (errorResp.error.inactive) {
        // Inform that login is OK
        this.loginIsOk("Login effettuato con successo!", false, $("#login-card"));

        // Activate the activation screen
        this.isToVerify = true;
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
      this.loginIsOk(resp.infoMessage + ". Reindirizzamento...", true, $("#verify-code-card"));
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

}
