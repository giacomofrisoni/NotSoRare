import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '../../../../../node_modules/@angular/router';
import { ProfileHolderService } from '../../services/profile-holder.service';

@Component({
  selector: 'app-profile-experiences',
  templateUrl: './profile-experiences.component.html',
  styleUrls: ['../../../assets/styles/profile-experiences.component.scss']
})
export class ProfileExperiencesComponent implements OnInit {


  isExperiencesLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isExperiencesEmpty: boolean = false;

  constructor(
    private profileHolder: ProfileHolderService,
    private userService: UserService) {

  }

  ngOnInit() {
    // Try to get params for user id
    this.profileHolder.getCurrentProfileData().subscribe(data => {
      // Only if there is a user ready
      /*      currentUserID: currentUserID,
      requestedUserID: requestedUserID*/
      if (data != null) {
        this.userService.getUserExperiences(data.requestedUserID).subscribe(results => {
          
        }, error => {

        })
      }
    }, error => {
      this.setPageStatus(true, true, false, "Error during retriving cached data", error)
    })
  }


  setPageStatus(ready: boolean, error: boolean, empty: boolean, message?: string, printError?: any) {
    this.isExperiencesEmpty = ready;
    this.isAnyErrorPresent = error;
    this.isExperiencesEmpty = empty;

    if (message) {
      console.log(message);
    }

    if (printError) {
      console.log(printError);
    }
  }

}
