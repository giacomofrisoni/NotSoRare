import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DiseaseService } from '../services/disease.service';
import { Speciality } from '../models/speciality';

@Component({
  selector: 'app-disease-search',
  templateUrl: './disease-search.component.html',
  styleUrls: ['../../assets/styles/disease-search.component.scss']
})
export class DiseaseSearchComponent implements OnInit {

  // Loadings
  isLoadingCompleted: boolean = false;
  isLoading: boolean = true;
  isAnyErrorPresent: boolean = false;
  isResultsEmpty = false;

  cachedSpecialties: Speciality[];
  specialties: Speciality[];

  constructor(private router: Router, private diseaseService: DiseaseService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.diseaseService.getAllDiseases().subscribe((results: Speciality[]) => {
      // Try to get results
      if (results) {
        if (results.length > 0) {
          this.cachedSpecialties = results;
          this.specialties = this.cachedSpecialties;
        } else {
          this.isResultsEmpty = true;
        }

        // Finished loading
        this.isLoadingCompleted = true;
        this.isLoading = false;
      }
    }, error => {
      this.isLoading = false;
      this.isAnyErrorPresent = true;
    })
  }

  openDisease(value: any) {
    this.router.navigate(["/disease/" + value]);
  }
}
