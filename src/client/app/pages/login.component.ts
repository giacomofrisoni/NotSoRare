import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import * as $ from 'jquery';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/styles/login.component.scss']
})
export class LoginComponent implements OnInit {

  error: string = "";
  isToVerify: boolean = false;
  email: string;
  password: string;
  verificationCode: string;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.userService.isLoggedIn().subscribe((resp: any) =>{
      if (resp.loggedIn) {
        this.loginIsOk("Login già effettuato! Verrai reindirizzato tra poco", true);
      }
    }, (errorResp) => {
      console.log("error!");
      console.log(errorResp);
    });
  }


  onLogin() {
    this.userService.login(this.email, this.password).subscribe((resp: any) => {
      this.loginIsOk("Login effettuato con successo! Verrai reindirizzato tra poco", true);
    }, 
    
    (errorResp) => {
      console.log(errorResp);
      console.log(errorResp.error.inactive);

      if (errorResp.error.inactive) {
        this.isToVerify = true;
        this.loginIsOk("Login effettuato con successo!", false);
      }
    });
  }

  onCodeCheck() {
    this.userService.activate(this.email, this.verificationCode).subscribe((resp: any) => {
      // OK
      console.log(resp);
      $("#verify-code-card").html("<p>" + resp.infoMessage + "</p>");
    }, 
    
    (errorResp) => {
      console.log(errorResp);
      console.log("Error!");
    });;
  }

  loginIsOk(message: string, isToRedirect: boolean) {
    $("#login-card").html("<p><i class='fa fa-spinner fa-spin'></i> " + message + "</p>");

    if (isToRedirect) {
      var v = this.router;
      setTimeout(function(){ 
        v.navigate(['./home']);
      }, 3000);
    }
  }

}
