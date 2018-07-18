import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileHolderService } from '../../services/profile-holder.service';
import { Subscription } from '../../../../../node_modules/rxjs';

@Component({
  selector: 'app-profile-experiences',
  templateUrl: './profile-experiences.component.html',
  styleUrls: ['../../../assets/styles/profile-experiences.component.scss']
})
export class ProfileExperiencesComponent implements OnInit {

  // Loading
  isExperiencesLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isExperiencesEmpty: boolean = false;

  // Binding
  experiences: any[];

  // Subscriptions
  subProfileHolder: Subscription;
  subUserService: Subscription;

  constructor(
    private profileHolder: ProfileHolderService,
    private userService: UserService,
    private router: Router) {

  }

  ngOnInit() {
    // Try to get params for user id
    this.subProfileHolder = this.profileHolder.getCurrentProfileData().subscribe(data => {
      // Only if there is a user ready
      /*      currentUserID: currentUserID,
      requestedUserID: requestedUserID*/
      if (data != null) {
        this.subUserService = this.userService.getUserExperiences(data.requestedUserID).subscribe((results: any[]) => {
          if (results) {
            if (results.length > 0) {
              this.experiences = results;
            } else {
              this.isExperiencesEmpty = true;
            }
          } else {
            this.isAnyErrorPresent = true;
          }

          this.isExperiencesLoaded = true;

        }, error => {
          this.setPageStatus(true, true, false, "Error during retriving experiences", error)
        })
      }
    }, error => {
      this.setPageStatus(true, true, false, "Error during retriving cached data", error)
    })
  }

  openExperience(codDisease: any, codUser: any) {
    this.router.navigate(["/disease/" + codDisease + "/experiences/" + codUser]);
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

  ngOnDestroy() {
    // Reset all subscriptions
    this.unsubscribeAll();
  }

  private unsubscribeAll() {
    if (this.subProfileHolder) this.subProfileHolder.unsubscribe();
    if (this.subUserService) this.subUserService.unsubscribe();
  }

}
