import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../../assets/styles/login.component.scss']
})
export class LoginComponent implements OnInit {

  error: string = "";
  email: string;
  password: string;

  constructor(private userService: UserService) { }

  ngOnInit() {

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
    });;
  }
}
