import { Component, OnInit } from '@angular/core';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '../../../../../node_modules/@angular/router';
import { Disease } from '../../models/disease';
import { ForumThreadDetails } from '../../models/forum-thread-details';
import { ForumService } from '../../services/forum.service';

@Component({
  selector: 'app-forum-thread',
  templateUrl: './forum-thread.component.html',
  styleUrls: ['../../../assets/styles/forum-thread.component.scss']
})
export class ForumThreadComponent implements OnInit {

  constructor(
    private forumService: ForumService,
    private diseaseHolder: DiseaseHolderService,
    private userService: UserService,
    private route: ActivatedRoute) {
  }

  // Loading
  isThreadLoaded = false;
  isAnyErrorPresent = false;
  isUserLoggedIn = false;

  // Binding
  disease: Disease;
  thread: ForumThreadDetails;


  ngOnInit() {
    // Try to get disease, when ready
    this.diseaseHolder.getDisease().subscribe(disease => {
      if (disease != null) {
        // Save for future reference
        this.disease = disease;

        // Check for user login
        this.userService.getLoggedInStatus("Forum").subscribe((user: any) => {
          if (user.loggedIn) {
            this.isUserLoggedIn = true;

            // Reset variables
            this.isThreadLoaded = false;
            this.isAnyErrorPresent = false;

            // Try to get the param
            this.route.params.subscribe(params => {
              let codThread: number = Number(params['codThread']);
    
              // Convert to number
              if (!isNaN(codThread)) {
                // Try to get details for the thread
                this.forumService.getThread(this.disease.general.CodDisease, codThread).subscribe((result: ForumThreadDetails) => {
                  if (result) {
                    this.thread = result;
                    console.log(this.thread);
                  } else {
                    this.setOnErroStatus("Invalid format");
                  }

                  this.isThreadLoaded = true;
                }, error =>{
                  // Error during retriving
                  this.setOnErroStatus("Error during retriving details");
                  console.log(error);
                });

              } 
              
              // That was not a number!
              else {
                this.setOnErroStatus("Not a number");
              }
            }, error => {
              // Cannot retrive param
              this.setOnErroStatus("Error retriving param");
              console.log(error);
            });

          }

          // User is not logged in
          else {
            this.isUserLoggedIn = false;
            this.isThreadLoaded = true;
          }
        }, error => {
          // Cannot find if user is logged or not
          this.isAnyErrorPresent = true;
          this.isThreadLoaded = true;
          console.log(error);
        });
      }
    }, error => {
      // Error when getting disease
      this.isAnyErrorPresent = true;
      this.isThreadLoaded = true;
      console.log(error);
    });
  }

  setWindowStatus(loaded, empty, error, message?) {
    this.isThreadLoaded = loaded;
    this.isAnyErrorPresent = error;

    if (message) console.log(message);
  }

  setOnErroStatus(message) {
    this.setWindowStatus(true, false, true, message);
  }


}
