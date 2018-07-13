import { Component, OnInit } from '@angular/core';
import { ExperiencePreview } from '../../models/experience-preview';
import { ExperiencesService } from '../../services/experiences.service';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { Disease } from '../../models/disease';
import { Router } from '../../../../../node_modules/@angular/router';

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

  // Binding
  experiences: ExperiencePreview[] = new Array();
  disease: Disease;


  constructor(private diseaseHolder: DiseaseHolderService, private experiencesService: ExperiencesService, private router: Router) { }

  ngOnInit() {
    this.diseaseHolder.getDisease().subscribe(disease =>{
      //Save for future reference
      this.disease = disease;

      //Try to get all experiences
      this.experiencesService.getAllExperiences(this.disease.general.CodDisease).subscribe((results: ExperiencePreview[]) =>{
        // If the type is ok
        if (results){
          // If something is inside
          if (results.length > 0) {
            this.experiences = results;
            console.log(this.experiences);
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

      }, error =>{
        // Error when getting experiences
        this.isAnyErrorPresent = true;
        this.isExperiencesLoaded = true;
        console.log(error);
      });
    }, error =>{
      // Error when getting disease
      this.isAnyErrorPresent = true;
      this.isExperiencesLoaded = true;
      console.log(error);
    })
    
  }


  openExperience(codUser: number) {
    //If I pressed an experience, I have already the disease
    this.router.navigate(["/disease/" + this.disease.general.CodDisease + "/experiences/" + codUser]);
  }

}
