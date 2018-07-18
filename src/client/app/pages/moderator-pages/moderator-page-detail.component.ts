import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '../../../../../node_modules/@angular/router';

@Component({
  selector: 'app-moderator-page-detail',
  templateUrl: './moderator-page-detail.component.html',
  styleUrls: ['../../../assets/styles/moderator-page-detail.component.scss']
})
export class ModeratorPageDetailComponent implements OnInit {

  isUserLoggedIn = false;
  isModeratorLoaded = false;
  isThreadEmpty = false;
  isAnyErrorPresent = false;
  isThreadLoaded = false;

  codDisease = -1;
  thread: any;

  constructor(private forumService: ForumService, private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.userService.getLoggedInStatus("ModeratorDetail").subscribe((user: any) => {
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
          // Get the param
          this.route.params.subscribe(params => {
            let codThread: number = Number(params['id']);

            // If param is valid
            if (!isNaN(codThread)) {
              // Try to get all threads
              this.forumService.getThread(this.codDisease, codThread).subscribe((result: any) => {
                if (result) {
                  this.thread = result;
                } else {
                  this.isAnyErrorPresent = true;
                  console.log("unexpected value");
                }
                
                this.isThreadLoaded = true;
              }, error => {
                // Error during thread retriving
                this.isThreadLoaded = true;
                this.isAnyErrorPresent = true;
                console.log(error);
              });
            } else {
              // Not a number!
              this.isAnyErrorPresent = true;
              this.isThreadLoaded = true;
              console.log("Not a number!")
            }
          }, error => {
            // Invalid param!
            this.isThreadLoaded = true;
            this.isAnyErrorPresent = true;
            console.log(error);
          });
        }
      } else {
        // Not logged in
        this.isUserLoggedIn = false;
        this.isThreadLoaded = true;
        console.log("User not logged in");
      }
    }, error => {
      this.isAnyErrorPresent = true;
      this.isUserLoggedIn = false;
      console.log(error);
    });
  }

}
