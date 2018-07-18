import { Component, OnInit } from '@angular/core';
import { ExperiencePreview } from '../../models/experience-preview';
import { ExperiencesService } from '../../services/experiences.service';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { Disease } from '../../models/disease';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Subscription } from '../../../../../node_modules/rxjs';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['../../../assets/styles/experiences.component.scss']
})
export class ExperiencesComponent implements OnInit {

  // Loading
  isExperiencesLoaded: boolean = false;
  isExperiencesEmpty: boolean = false;
  isAnyErrorPresent: boolean = false;
  isUserLoggedIn = false;

  // Binding
  experiences: ExperiencePreview[] = new Array();
  disease: Disease;
  selectedItem: any;
  filters: any[] = [
    {
      text: 'Data pubblicazione',
      icon: 'fa fa-long-arrow-up',
      value: '+creationdate'
    },
    {
      text: 'Data pubblicazione',
      icon: 'fa fa-long-arrow-down',
      value: '-creationdate'
    }
  ];

  //Subscribes
  subDiseaseHolder: Subscription;
  subRoute: Subscription;
  subExperiencesService: Subscription;
  subUserService: Subscription;


  constructor(
    private diseaseHolder: DiseaseHolderService,
    private experiencesService: ExperiencesService,
    private router: Router,
    private userService: UserService) { }

  ngOnInit() {
    this.subDiseaseHolder = this.diseaseHolder.getDisease().subscribe(disease => {
      if (disease != null) {
        //Save for future reference
        this.disease = disease;

        //Try to get all experiences
        this.subExperiencesService = this.experiencesService.getAllExperiences(this.disease.general.CodDisease).subscribe((results: ExperiencePreview[]) => {

          this.subUserService = this.userService.getLoggedInStatus("Experiences").subscribe((user: any) => {
            this.isUserLoggedIn = user.loggedIn ? true : false;

            // If the type is ok
            if (results) {
              // If something is inside
              if (results.length > 0) {
                this.experiences = results;
              }
              // Collection is empty
              else {
                this.experiences = [];
                this.isExperiencesEmpty = true;
              }
            }

            // Wrong type
            else {
              this.isAnyErrorPresent = true;
              console.log("Results non era del tipo previsto");
            }

            // Anyway, finish to load
            this.isExperiencesLoaded = true;
          }, error => {
            this.isAnyErrorPresent = true;
            this.isExperiencesLoaded = true;
            this.isUserLoggedIn = false;
            console.log(error);
          });
        }, error => {
          // Error when getting experiences
          this.isAnyErrorPresent = true;
          this.isExperiencesLoaded = true;
          console.log(error);
        });
      }
    }, error => {
      // Error when getting disease
      this.isAnyErrorPresent = true;
      this.isExperiencesLoaded = true;
      console.log(error);
    });
  }


  openExperience(codUser: number) {
    //If I pressed an experience, I have already the disease
    this.router.navigate(["/disease/" + this.disease.general.CodDisease + "/experiences/" + codUser]);
  }

  onItemSelected() {
    this.isExperiencesLoaded = false;
    this.isExperiencesEmpty = false;
    this.isAnyErrorPresent = false;
    this.experiences = [];

    this.experiencesService.getAllExperiences(this.disease.general.CodDisease, this.selectedItem).subscribe((results: ExperiencePreview[]) => {
      // If the type is ok
      if (results) {
        // If something is inside
        if (results.length > 0) {
          this.experiences = results;
        }
        // Collection is empty
        else {
          this.experiences = [];
          this.isExperiencesEmpty = true;
        }
      }

      // Wrong type
      else {
        this.isAnyErrorPresent = true;
        console.log("Results non era del tipo previsto");
      }

      // Anyway, finish to load
      this.isExperiencesLoaded = true;

    }, error => {
      // Error when getting experiences
      this.isAnyErrorPresent = true;
      this.isExperiencesLoaded = true;
      console.log(error);
    });
  }

  ngOnDestroy() {
    // Reset all subscriptions
    this.unsubscribeAll();
  }

  private unsubscribeAll() {
    if (this.subDiseaseHolder) this.subDiseaseHolder.unsubscribe();
    if (this.subExperiencesService) this.subExperiencesService.unsubscribe();
    if (this.subRoute) this.subRoute.unsubscribe();
    if (this.subUserService) this.subUserService.unsubscribe();
  }
}
