import { Component, OnInit } from '@angular/core';
import { DiseaseService } from '../services/disease.service';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { Disease } from '../models/disease';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { LanguageService } from '../services/language.service';
import { DiseaseHolderService } from '../services/disease-holder.service';

@Component({
  selector: 'app-disease',
  templateUrl: './disease.component.html',
  styleUrls: ['../../assets/styles/disease.component.scss']
})
export class DiseaseComponent implements OnInit {

  // Loading
  isDiseaseLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isFirstTimeLoading: boolean = true;

  // Disease object
  disease: Disease;

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
    this.languageService.getCurrentLanguage().subscribe(newLanguage =>{
      if (this.isFirstTimeLoading) {
        this.isFirstTimeLoading = false;
      } else {
        window.location.reload();
      }
    });

    // Subscribe to retrive params
    this.route.params.subscribe(params => {
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

}