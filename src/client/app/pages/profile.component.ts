import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['../../assets/styles/profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
  }

  onLogout() {
    this.userService.logout().subscribe((resp: any) =>{
      console.log(resp);
      console.log("ok!");
      this.userService.getLoggedInStatus();
      this.router.navigate(['./home']);
    }, (errorResp) => {
      console.log("error!");
      console.log(errorResp);
      this.userService.getLoggedInStatus();
    });
  }

}
