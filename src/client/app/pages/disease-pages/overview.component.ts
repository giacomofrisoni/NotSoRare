import { Component, OnInit } from '@angular/core';
import { Disease } from '../../models/disease';
import { DiseaseHolderService } from '../../services/disease-holder.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['../../../assets/styles/overview.component.scss']
})
export class OverviewComponent implements OnInit {

  // Loading
  isDiseaseLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;

  // Binding disease
  disease: Disease;

  constructor(private diseaseHolder: DiseaseHolderService) {
    this.diseaseHolder.getDisease().subscribe((disease: Disease) => {
      if (disease != null) {
        this.isDiseaseLoaded = true;
        this.disease = disease;
      }
    }, error => {
      this.isDiseaseLoaded = true;
      this.isAnyErrorPresent = true;
      console.log(error);
    });
  }

  ngOnInit() {

  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

}
