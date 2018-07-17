import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['../../assets/styles/profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // Loading
  isProfileLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isUserLoggedIn: boolean = false;

  // Binding
  user: User = new User();


  constructor(
    private userService: UserService, 
    private router: Router) {/*,
    private sanitizer: DomSanitizer) { */
  }

  ngOnInit() {
    this.userService.getLoggedInStatus("Profile").subscribe((user: any) => {
      if (user.loggedIn) {
        this.isUserLoggedIn = true;

        this.userService.getUserData(user.loggedIn).subscribe((result: User) => {
          if (result) {
            this.user = result;
            console.log(this.user);
          } else {
            this.isAnyErrorPresent = true;
            console.log("Unexpected type");
          }

          this.isProfileLoaded = true;
        }, error =>{
          this.isProfileLoaded = true;
          this.isUserLoggedIn = false;
          console.log(error);
        });
      } else {
        this.isProfileLoaded = true;
        this.isUserLoggedIn = false;
        console.log("user not logged in");
      }
    }, error => {
      this.isProfileLoaded = true;
      this.isAnyErrorPresent = true;
      this.isUserLoggedIn = false;
      console.log(error);
    })
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
