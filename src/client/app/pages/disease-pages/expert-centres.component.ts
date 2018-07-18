import { Component, OnInit } from '@angular/core';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { Disease } from '../../models/disease';
import { ExpertCentre } from '../../models/expert-centre';
import { ExpertCentresService } from '../../services/expert-centres.service';
import { Subscription } from '../../../../../node_modules/rxjs';

@Component({
  selector: 'app-expert-centres',
  templateUrl: './expert-centres.component.html',
  styleUrls: ['../../../assets/styles/expert-centres.component.scss']
})
export class ExpertCentresComponent implements OnInit {

  // Loading
  isExpertCentresEmpty = false;
  isExpertCentresLoaded = false;
  isAnyErrorPresent = false;

  // Bindings
  disease: Disease;
  expertCentres: ExpertCentre[];

  //Subscribes
  subDiseaseHolder: Subscription;
  subExpertCentresService: Subscription;

  constructor(private diseaseHolder: DiseaseHolderService, private expertCentresService: ExpertCentresService) { }

  ngOnInit() {
    this.subDiseaseHolder = this.diseaseHolder.getDisease().subscribe(disease => {
      if (disease != null) {
        //Save for future reference
        this.disease = disease;

        //Try to get all experiences
        this.subExpertCentresService = this.expertCentresService.getAllExpertCentres(this.disease.general.CodDisease).subscribe((results: ExpertCentre[]) => {
          // If the type is ok
          if (results) {
            // If something is inside
            if (results.length > 0) {
              this.expertCentres = results;
            }
            // Collection is empty
            else {
              this.expertCentres = [];
              this.isExpertCentresEmpty = true;
            }
          }

          // Wrong type
          else {
            this.isAnyErrorPresent = true;
            console.log("Results non era del tipo previsto");
          }

          // Anyway, finish to load
          this.isExpertCentresLoaded = true;

        }, error => {
          // Error when getting experiences
          this.isAnyErrorPresent = true;
          this.isExpertCentresLoaded = true;
          console.log(error);
        });
      }
    }, error => {
      // Error when getting disease
      this.isAnyErrorPresent = true;
      this.isExpertCentresLoaded = true;
      console.log(error);
    })
  }

  ngOnDestroy() {
    // Reset all subscriptions
    this.unsubscribeAll();
  }

  private unsubscribeAll() {
    if (this.subDiseaseHolder) this.subDiseaseHolder.unsubscribe();
    if (this.subExpertCentresService) this.subExpertCentresService.unsubscribe();
  }

}
