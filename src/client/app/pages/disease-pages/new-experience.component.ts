import { Component, OnInit } from '@angular/core';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { UserService } from '../../services/user.service';
import { Disease } from '../../models/disease';
import { ExperiencesService } from '../../services/experiences.service';
import { Router } from '@angular/router';
import { Subscription } from '../../../../../node_modules/rxjs';

@Component({
  selector: 'app-new-experience',
  templateUrl: './new-experience.component.html',
  styleUrls: ['../../../assets/styles/new-experience.component.scss']
})
export class NewExperienceComponent implements OnInit {

  // Loading
  isPageLoading: boolean = true;
  isUserLoggedIn: boolean = false;
  isSubmitting: boolean = false;
  isPageErrorPresent: boolean = false;
  isAnyErrorPresent: boolean = false;
  isEmpty: boolean = false;

  // Binding
  experienceText: string;
  disease: Disease;
  userID: number;

  // Subscriptions
  subDiseaseHolder: Subscription;
  subUserService: Subscription;
  subExperiencesService: Subscription;

  constructor(
    private diseaseHolder: DiseaseHolderService,
    private userService: UserService,
    private experiencesService: ExperiencesService,
    private router: Router) { }

  ngOnInit() {
    // Try to get disease, when ready
    this.subDiseaseHolder = this.diseaseHolder.getDisease().subscribe(disease => {
      if (disease != null) {
        // Save for future reference
        this.disease = disease;

        // Check for user login
        this.subUserService = this.userService.getLoggedInStatus("NewExperience").subscribe((user: any) => {
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
    if (this.experienceText) {
      // Am I ready to send?
      if (this.experienceText != "") {
        // Yes! Sending
        this.isSubmitting = true;
        this.subExperiencesService = this.experiencesService.addNewExperience(this.disease.general.CodDisease, this.userID, this.experienceText).subscribe(result => {
          // All ok
          this.router.navigate(["/disease/" + this.disease.general.CodDisease + "/experiences"]);
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

  ngOnDestroy() {
    // Reset all subscriptions
    this.unsubscribeAll();
  }

  private unsubscribeAll() {
    if (this.subDiseaseHolder) this.subDiseaseHolder.unsubscribe();
    if (this.subExperiencesService) this.subExperiencesService.unsubscribe();
    if (this.subUserService) this.subUserService.unsubscribe();
  }

}
