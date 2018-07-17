import { Component, OnInit } from '@angular/core';
import { ProfileHolderService } from '../../services/profile-holder.service';

@Component({
  selector: 'app-profile-followed-diseases',
  templateUrl: './profile-followed-diseases.component.html',
  styleUrls: ['../../../assets/styles/profile-followed-diseases.component.scss']
})
export class ProfileFollowedDiseasesComponent implements OnInit {

  isFollowedDiseasesLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isFollowedDiseasesEmpty: boolean = false;

  constructor(
    private profileHolder: ProfileHolderService) { }

  ngOnInit() {
    // Try to get params for user id
    this.profileHolder.getCurrentProfileData().subscribe(data => {
      // Only if there is a user ready
      /*      currentUserID: currentUserID,
      requestedUserID: requestedUserID*/
      if (data != null) {
        
      }
    }, error => {
      this.setPageStatus(true, true, false, "Error during retriving cached data", error)
    })
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
