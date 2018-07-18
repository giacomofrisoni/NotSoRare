import { Component, OnInit } from '@angular/core';
import { ProfileHolderService } from '../../services/profile-holder.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-followed-diseases',
  templateUrl: './profile-followed-diseases.component.html',
  styleUrls: ['../../../assets/styles/profile-followed-diseases.component.scss']
})
export class ProfileFollowedDiseasesComponent implements OnInit {

  // Loading
  isFollowedDiseasesLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isFollowedDiseasesEmpty: boolean = false;
  
  // Binding
  followedDiseases: any[];

  constructor(
    private profileHolder: ProfileHolderService,
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    // Try to get params for user id
    this.profileHolder.getCurrentProfileData().subscribe(data => {
      // Only if there is a user ready
      /*      currentUserID: currentUserID,
      requestedUserID: requestedUserID*/
      if (data != null) {
        // Try to get the followed diseases
        this.userService.getFollowingDiseases(data.requestedUserID).subscribe((data: any[]) => {
          if (data) {
            if (data.length > 0) {
              // Data ok
              this.followedDiseases = data;
            } else {
              // Data ok but empty
              this.isFollowedDiseasesEmpty = true;
            }
          } else {
            // Error!
            this.isAnyErrorPresent = true;
          }

          this.isFollowedDiseasesLoaded = true;
        }, error =>{
          // Error!
          this.setPageStatus(true, true, false, "Error during retriving followed diseases", error)
        });
      }
    }, error => {
      this.setPageStatus(true, true, false, "Error during retriving cached data", error)
    })
  }

  openDisease(value: any) {
    this.router.navigate(['./disease/' + value]);
  }

  setPageStatus(ready: boolean, error: boolean, empty: boolean, message?: string, printError?: any) {
    this.isFollowedDiseasesLoaded = ready;
    this.isAnyErrorPresent = error;
    this.isFollowedDiseasesEmpty = empty;

    if (message) {
      console.log(message);
    }

    if (printError) {
      console.log(printError);
    }
  }
}
