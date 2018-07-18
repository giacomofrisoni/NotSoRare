import { Component, OnInit } from '@angular/core';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { UserService } from '../../services/user.service';
import { Disease } from '../../models/disease';
import { ExperiencesService } from '../../services/experiences.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-thread',
  templateUrl: './new-thread.component.html',
  styleUrls: ['../../../assets/styles/new-thread.component.scss']
})
export class NewThreadComponent implements OnInit {

  // Loading
  isPageLoading: boolean = true;
  isUserLoggedIn: boolean = false;
  isSubmitting: boolean = false;
  isPageErrorPresent: boolean = false;
  isAnyErrorPresent: boolean = false;
  isEmpty: boolean = false;

  // Binding
  threadTitle: string;
  threadText: string;
  disease: Disease;
  userID: number;

  constructor(
    private diseaseHolder: DiseaseHolderService,
    private userService: UserService,
    private experiencesService: ExperiencesService,
    private router: Router) { }

  ngOnInit() {
    // Try to get disease, when ready
    this.diseaseHolder.getDisease().subscribe(disease => {
      if (disease != null) {
        // Save for future reference
        this.disease = disease;

        // Check for user login
        this.userService.getLoggedInStatus("NewThread").subscribe((user: any) => {
          if (user.loggedIn) {
            this.isUserLoggedIn = true;
            this.userID = user.loggedIn;
          } else {
            this.isUserLoggedIn = false;
          }

          this.isPageLoading = false;
        }, error => {
          // Cannot retrive user login status
          this.isPageErrorPresent = true;
          this.isPageLoading = false;
          console.log(error);
        });
      }
    }, error => {
      // Cannot find disease
      this.isPageErrorPresent = true;
      this.isPageLoading = false;
      console.log(error);
    });
  }

  onSubmit() {
    if (this.threadTitle && this.threadText) {
      // Am I ready to send?
      if (this.threadText != "" && this.threadTitle != "") {
        // Yes! Sending
        this.isSubmitting = true;
        this.experiencesService.addNewThread(this.disease.general.CodDisease, this.userID, this.threadTitle, this.threadText).subscribe(result => {
          // All ok
          this.router.navigate(["/disease/" + this.disease.general.CodDisease + "/forum"]);
        }, error => {
          // Something wrong
          this.isAnyErrorPresent = true;
          this.isSubmitting = false;
          console.log(error);
        });
      }

      // Nope, it's empty
      else {
        this.isEmpty = true;
        this.isSubmitting = false;
      }
    }

    // Nope, it doesn't exist
    else {
      this.isEmpty = true;
      this.isSubmitting = false;
    }
  }
}
