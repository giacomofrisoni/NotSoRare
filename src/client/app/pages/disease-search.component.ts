import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '../../../../node_modules/@angular/router';
import { DiseaseService } from '../services/disease.service';
import { Subject } from '../../../../node_modules/rxjs';
import { SearchBarComponent } from '../components/search-bar.component';

@Component({
  selector: 'app-disease-search',
  templateUrl: './disease-search.component.html',
  styleUrls: ['../../assets/styles/disease-search.component.scss']
})
export class DiseaseSearchComponent implements OnInit {

  // View
  @ViewChild('searchBar') searchBar: SearchBarComponent;

  // Loadings
  isValueSearching: boolean = true;
  isGeneralSearch: boolean = false;
  isAnyErrorPresent: boolean = false;
  isOpeningDisease: boolean = false;
  isResultsEmpty = false;

  // Bindings
  searchResults: Subject<any> = new Subject();

  constructor(private router: Router, private diseaseService: DiseaseService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        // Resetting all values
        this.isValueSearching = true;
        this.isGeneralSearch = false;
        this.isAnyErrorPresent = false;
        this.isOpeningDisease = false;
        this.isResultsEmpty = false;

        // Set the current search bar
        this.searchBar.searchedDisease = params.id;

        // Try to get diseaeses
        this.diseaseService.searchDisease(params.id).subscribe((results: any) => {
          // It's a defined and not null object
          if (results) {
            // Has some elements
            if (results.length > 0) {
              this.searchResults.next(results);
            }

            // It's empty
            else {
              this.searchResults.next([]);
              this.isResultsEmpty = true;
            }
          }

          //Anyway, I finished loading it
          this.isValueSearching = false;

        }, error => {
          // Something went wrong!
          this.isValueSearching = false;
          this.isAnyErrorPresent = true;
        });
      }

      // I'm not searching the parameter, reset
      else {
        this.isValueSearching = false;
      }
    });
  }

  openDisease(value: any) {
    this.router.navigate(["/disease/" + value]);
  }

  onResultClicked(value: any) {
    this.openDisease(value);
  }

  onSearchClicked(value: any) {
    // Reset all variables
    this.isValueSearching = false;
    this.isGeneralSearch = false;
    this.isOpeningDisease = false;
    this.isAnyErrorPresent = false;
    this.isResultsEmpty = false;
    this.searchResults.next([]);

    // Variable empty
    if (value == null || value == undefined || value == "") {
      this.isGeneralSearch = true;
      this.isValueSearching = true;

      // Try to get ALL diseaeses
      this.diseaseService.getAllDiseases().subscribe((results: any) => {
        // It's a defined and not null object
        if (results) {
          // Has some elements
          if (results.length > 0) {
            this.searchResults.next(results);
            console.log(results);
          }

          // It's empty
          else {
            this.searchResults.next([]);
            this.isResultsEmpty = true;
          }
        }

        //Anyway, I finished loading it
        this.isValueSearching = false;

      }, error => {
        // Something went wrong!
        this.isValueSearching = false;
        this.isAnyErrorPresent = true;
        console.log(error);
      });
    }

    // Variable not empty
    else {
      // If it's a selected object
      if (value.CodDisease) {
        this.isOpeningDisease = true;
        this.router.navigate(["/disease/" + value]);
      }

      // It's a simple string, searching
      else {
        this.router.navigate(["/disease-search/" + value]);
      }
    }

  }



}
