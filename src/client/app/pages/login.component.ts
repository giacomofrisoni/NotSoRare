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

  @ViewChild('loginButton') loginButton: DivbuttonComponent;

  error: string = "";
  isToVerify: boolean = false;
  email: string;
  password: string;
  verificationCode: string;

  getLoggedInStatus: Subscription;
  login: Subscription;
  activate: Subscription;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    // Trying to check the login
    this.getLoggedInStatus = this.userService.getLoggedInStatus().subscribe(status => {
      // If something was returned
      if (status == SessionStatus.LoggedIn) {
        // Status ok, you're already logged in!
        this.loginIsOk("Login già effettuato, verrai reindirizzato tra poco!", true);
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
    this.login = this.userService.login(this.email, this.password).subscribe((resp: any) => {
      // Ok, all is clear
      this.loginIsOk("Login effettuato con successo! Verrai reindirizzato tra poco", true);
    }, 
    
    // ERROR or NEED ACTIVATION
    (errorResp) => {
      console.log(errorResp);
      console.log(errorResp.error.inactive);

      // If is inactive, need activation!
      if (errorResp.error.inactive) {
        // Inform that login is OK
        this.loginIsOk("Login effettuato con successo!", false);

        // Activate the activation screen
        this.isToVerify = true;
      }

      this.loginButton.icon = "";
    });
  }

  onCodeCheck() {
    // Try to activate the user
    this.activate = this.userService.activate(this.email, this.verificationCode).subscribe((resp: any) => {
      // Activation was succesfull
      $("#verify-code-card").html("<p>" + resp.infoMessage + "</p>");
      this.loginIsOk("Login e attivazione avvenuti con successo... Reindirizzamento", true);
    }, 
    
    (errorResp) => {
      console.log(errorResp);
      console.log("Error!");
    });
  }


  private loginIsOk(message: string, isToRedirect: boolean) {
    // Reset the login card 
    $("#login-card").html("<p><i class='fa fa-spinner fa-spin'></i> " + message + "</p>");

    // If i want also to redirect to home
    if (isToRedirect) {
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
    }
  }

  private unsubscribeAll() {
    if (this.getLoggedInStatus) this.getLoggedInStatus.unsubscribe();
    if (this.login) this.login.unsubscribe();
    if (this.activate) this.activate.unsubscribe();
  }

}
