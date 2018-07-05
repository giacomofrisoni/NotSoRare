import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['../../assets/styles/top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  isSessionValid: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userService.isLoggedIn().subscribe((resp: any) =>{
      if (resp.loggedIn) {
        this.isSessionValid = true;
      }
    }, (errorResp) => {
      console.log("error!");
      console.log(errorResp);
      this.isSessionValid = false;
    });
  }

}
