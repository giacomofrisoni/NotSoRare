import { Component, OnInit } from '@angular/core';
import { DiseaseService } from '../services/disease.service';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { Disease } from '../models/disease';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { LanguageService } from '../services/language.service';
import { DiseaseHolderService } from '../services/disease-holder.service';
import { Subscription } from '../../../../node_modules/rxjs';

@Component({
  selector: 'app-disease',
  templateUrl: './disease.component.html',
  styleUrls: ['../../assets/styles/disease.component.scss']
})
export class DiseaseComponent implements OnInit {

  // Loading
  isDiseaseLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  loadingTimes: number = 0;

  // Disease object
  disease: Disease;

  // Subscriptions to destroy
  subLanguageService: Subscription;
  subParams: Subscription;

  constructor(
    private diseaseService: DiseaseService,
    private translate: TranslateService, 
    private route: ActivatedRoute, 
    private languageService: LanguageService,
    private diseaseHolder: DiseaseHolderService) {
    this.disease = new Disease();
  }

  ngOnInit() {
    // Subscribe to change language
    this.subLanguageService = this.languageService.getCurrentLanguage().subscribe(newLanguage =>{
      if (this.loadingTimes > 1) {
        window.location.reload();
      } else {
        this.loadingTimes++; 
      }
    });

    // Subscribe to retrive params
    this.subParams = this.route.params.subscribe(params => {
      // First check if it's a valid param (number)
      let id: number = Number(params['id']);
      if (!isNaN(id)) {
        // Try to get the data
        this.diseaseService.getDisease(params['id']).subscribe((disease: Disease) => {
          // Data are ok, set it!
          this.disease = disease;
          this.diseaseHolder.setDisease(this.disease);
    
          // Inform the view
          this.isDiseaseLoaded = true;
          this.isAnyErrorPresent = false;
          
        }, error => {
          // Inform the view
          this.isDiseaseLoaded = true;
          this.isAnyErrorPresent = true;
    
          console.log(error);
        });
      } else {
        // Inform the view
        this.isDiseaseLoaded = true;
        this.isAnyErrorPresent = true;
      }
    });
  }


  ngOnDestroy() {
    // Reset all subscriptions
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.subLanguageService.unsubscribe();
    this.subParams.unsubscribe();
  }

}
