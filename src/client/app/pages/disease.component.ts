import { Component, OnInit } from '@angular/core';
import { DiseaseService } from '../services/disease.service';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { Disease } from '../models/disease';
import { ActivatedRoute } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-disease',
  templateUrl: './disease.component.html',
  styleUrls: ['../../assets/styles/disease.component.scss']
})
export class DiseaseComponent implements OnInit {

  // Loading
  isDiseaseLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;

  // Disease object
  disease: Disease;

  constructor(private diseaseService: DiseaseService, private translate: TranslateService, private route: ActivatedRoute) {
    this.disease = new Disease();
  }

  ngOnInit() {
    // Subscribe to retrive params
    this.route.params.subscribe(params => {
      // First check if it's a valid param (number)
      let id: number = Number(params['id']);
      if (!isNaN(id)) {
        // Try to get the data
        this.diseaseService.getDisease(params['id']).subscribe((disease: Disease) => {
          // Data are ok, set it!
          this.disease = disease;
    
          // Inform the view
          this.isDiseaseLoaded = true;
          this.isAnyErrorPresent = false;
    
          console.log(this.disease)
    
          
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
