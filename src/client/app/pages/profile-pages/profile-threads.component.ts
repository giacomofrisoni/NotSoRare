import { Component, OnInit } from '@angular/core';
import { ProfileHolderService } from '../../services/profile-holder.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-threads',
  templateUrl: './profile-threads.component.html',
  styleUrls: ['../../../assets/styles/profile-threads.component.scss']
})
export class ProfileThreadsComponent implements OnInit {

  // Loading
  isThreadsLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isThreadsEmpty: boolean = false;

  // Binding
  threads: any[];

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
        // Try to get data
        this.userService.getUserThreads(data.requestedUserID).subscribe((data: any[]) => {
          if (data) {
            if (data.length > 0) {
              this.threads = data;
              console.log(this.threads);
            } else {
              this.isThreadsEmpty = true;
            }
          } else {
            this.isAnyErrorPresent = true;
          }

          this.isThreadsLoaded = true;
        }, error => {
          this.setPageStatus(true, true, false, "Error during retriving threads", error)
        });
      }
    }, error => {
      this.setPageStatus(true, true, false, "Error during retriving cached data", error)
    })
  }

  onThreadClick() {

  }


  setPageStatus(ready: boolean, error: boolean, empty: boolean, message?: string, printError?: any) {
    this.isThreadsLoaded = ready;
    this.isAnyErrorPresent = error;
    this.isThreadsEmpty = empty;

    if (message) {
      console.log(message);
    }

    if (printError) {
      console.log(printError);
    }
  }
}
