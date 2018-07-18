import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../services/forum.service';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { Disease } from '../../models/disease';
import { ForumThread } from '../../models/forum-thread';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['../../../assets/styles/forum.component.scss']
})
export class ForumComponent implements OnInit {
  
  // Loading
  isThreadsLoaded = false;
  isAnyErrorPresent = false;
  isThreadsEmpty = false;
  isUserLoggedIn = false;
  isModerator = false;

  // Binding
  disease: Disease;
  threads: ForumThread[];

  constructor(
    private forumService: ForumService,
    private diseaseHolder: DiseaseHolderService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.diseaseHolder.getDisease().subscribe(disease => {
      if (disease != null) {
        // Save for future reference
        this.disease = disease;

        // Check for user login
        this.userService.getLoggedInStatus("Forum").subscribe((user: any) => {
          if (user.loggedIn) {
            this.isUserLoggedIn = true;
            
            // Check if he's an admin
            if (user.codDisease) {
              this.isModerator = user.codDisease == this.disease.general.CodDisease;
            }

            // Reset variables
            this.isThreadsLoaded = false;
            this.isAnyErrorPresent = false;
            this.isThreadsEmpty = false;

            // Try to get all threads
            this.forumService.getAllThreads(this.disease.general.CodDisease).subscribe((results: ForumThread[]) => {
              if (results) {
                if (results.length > 0) {
                  this.threads = results;
                  console.log(this.threads);
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
          } else {
            this.isUserLoggedIn = false;
            this.isThreadsLoaded = true;
          }
        }, error => {
          this.isAnyErrorPresent = true;
          this.isThreadsLoaded = true;
        })



      }
    }, error => {
      // Error when getting disease
      this.isAnyErrorPresent = true;
      this.isThreadsLoaded = true;
      console.log(error);
    });
  }


  onThreadClick(threadCode: number) {
    this.router.navigate(['./' + threadCode], {relativeTo: this.activatedRoute});
  }

  onModeratorClick(threadCode: number) {
    console.log("moderate this shit!");
  }

}
