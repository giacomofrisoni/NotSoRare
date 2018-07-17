import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../models/user';
import { DomSanitizer } from '@angular/platform-browser';

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
  isProfileMine: boolean = false;

  // Binding
  user: User = new User();


  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    // First, try to get the user ID of the URL
    this.route.params.subscribe(params => {
      let requestedUserId: number = params['id'];

      // Check if it's a number
      if (!isNaN(requestedUserId)) {
        // Now try to get logged in status
        this.userService.getLoggedInStatus("Profile").subscribe((user: any) => {
          if (user.loggedIn) {
            // Ok, logged in
            this.isUserLoggedIn = true;
            this.isProfileMine = requestedUserId == user.loggedIn;
            
            // Get data of user
            this.userService.getUserData(requestedUserId).subscribe((result: User) => {
              if (result) {
                this.user = result;
                console.log(this.user);
              } else {
                this.isAnyErrorPresent = true;
                console.log("Unexpected type");
              }

              this.isProfileLoaded = true;
            }, error => {
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
      } else {
        this.setPageStatus(true, false, false, "Requested id is not a number");
      }
    }, error => {
      this.setPageStatus(true, false, false, "Requested id is not a number", error);
    });


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

  setPageStatus(ready: boolean, error: boolean, loggedin: boolean, message?: string, printError?: any) {
    this.isProfileLoaded = ready;
    this.isAnyErrorPresent = error;
    this.isUserLoggedIn = loggedin;

    if (message) {
      console.log(message);
    }

    if (printError) {
      console.log(printError);
    }
  }
}
