import { Component, OnInit } from '@angular/core';
import { Disease } from '../../models/disease';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { ReferencesService } from '../../services/references.service';

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['../../../assets/styles/references.component.scss']
})
export class ReferencesComponent implements OnInit {

  // Loading
  isReferencesLoaded = false;
  isReferencesEmpty = false;
  isAnyErrorPresent = false;

  // Binding
  references: any[];
  disease: Disease;

  constructor(private referencesService: ReferencesService, private diseaseHolder: DiseaseHolderService) { }

  ngOnInit() {
    this.diseaseHolder.getDisease().subscribe(disease => {
      //Save for future reference
      if (disease != null) {
        this.disease = disease;

        // Get the experience
        this.referencesService.getAllReferences(this.disease.general.CodDisease).subscribe((result: any) => {
          if (result) {
            this.references = result;
          } else {
            this.setOnErroStatus("Not valid type");
          }

          this.setWindowStatus(true, false, false, "Success!");
        }, error => {
          this.setOnErroStatus("Error retriving reference");
          console.log(error);
        });
      }
    }, error => {
      this.setOnErroStatus("References not found");
      console.log(error);
    });

  }

  setWindowStatus(isReferencesLoaded, isReferencesEmpty, isAnyErrorPresent, message?) {
    this.isReferencesLoaded = isReferencesLoaded;
    this.isReferencesEmpty = isReferencesEmpty;
    this.isAnyErrorPresent = isAnyErrorPresent;

    if (message) console.log(message);
  }

  setOnErroStatus(message) {
    this.setWindowStatus(true, false, true, message);
  }
}
