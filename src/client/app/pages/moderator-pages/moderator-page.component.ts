import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-moderator-page',
  templateUrl: './moderator-page.component.html',
  styleUrls: ['../../../assets/styles/moderator-page.component.scss']
})
export class ModeratorPageComponent implements OnInit {

  // Loading
  isThreadsLoaded = false;
  isAnyErrorPresent = false;
  isThreadsEmpty = false;
  isUserLoggedIn = false;
  isModeratorLoaded = false;
  codDisease: number = -1;

  // Binding
  threads: any[];


  constructor(private forumService: ForumService, private userService: UserService) { }

  ngOnInit() {
    this.userService.getLoggedInStatus("Moderator").subscribe((user: any) => {
      // Check if it's logged
      if (user.loggedIn) {
        this.isUserLoggedIn = true;

        // Check if he's an admin of this disease
        if (user.codDisease) {
          this.codDisease = user.codDisease;
        }

        // Inform view that moderato has been loaded
        this.isModeratorLoaded = true;

        // Only if I have valid data
        if (this.codDisease >= 0) {
          // Try to get all threads
          this.forumService.getAllThreads(this.codDisease).subscribe((results: any[]) => {
            if (results) {
              if (results.length > 0) {
                this.threads = results;
              }
              else {
                this.isThreadsEmpty = true;
              }
            } else {
              this.isAnyErrorPresent = true;
            }

            this.isThreadsLoaded = true;
          }, error => {
            this.isThreadsLoaded = true;
            this.isAnyErrorPresent = true;
            console.log(error);
          });
        }

      } else {
        this.isUserLoggedIn = false;
        console.log("User not logged in");
      }
    }, error => {
      this.isAnyErrorPresent = true;
      this.isUserLoggedIn = false;
      console.log(error);
    });
  }

}
