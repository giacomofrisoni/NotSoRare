import { Component, OnInit } from '@angular/core';
import { Disease } from '../../models/disease';
import { DiseaseHolderService } from '../../services/disease-holder.service';
import { Subscription } from '../../../../../node_modules/rxjs';

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

  // Subscriptions
  subDiseaseHolder: Subscription;

  constructor(private diseaseHolder: DiseaseHolderService) {
    this.subDiseaseHolder = this.diseaseHolder.getDisease().subscribe((disease: Disease) => {
      if (disease != null) {
        this.disease = disease;
        this.isDiseaseLoaded = true;
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

  ngOnDestroy() {
    // Reset all subscriptions
    this.unsubscribeAll();
  }

  private unsubscribeAll() {
    if (this.subDiseaseHolder) this.subDiseaseHolder.unsubscribe();
  }

}
