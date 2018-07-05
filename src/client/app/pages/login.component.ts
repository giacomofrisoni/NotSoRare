import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import * as $ from 'jquery';

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

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.isLoggedIn().subscribe((resp: any) =>{
      console.log("already logged in!");
      console.log(resp);

      $("#login-card").html("<p>Login già effettuato!</p>");
    }, (errorResp) => {
      console.log("error!");
      console.log(errorResp);
    });
  }


  onLogin() {
    this.userService.signIn(this.email, this.password).subscribe((resp: any) => {
      // OK
      console.log(resp);
      console.log("Ok!");
    }, 
    
    (errorResp) => {
      // Some error occurred
      console.log(errorResp);

      /*this.isToVerify = true;
      $("#login-card").html("<p>Login effettuato con successo!</p>");*/
    });;


  }
}
