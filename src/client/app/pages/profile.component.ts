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
    this.userService.logout().subscribe((resp: any) => {
      this.router.navigate(['./home']);
      this.userService.submitLoginChange();
    }, (errorResp) => {
      console.log(errorResp);
      this.userService.submitLoginChange();
    });
  }

}
