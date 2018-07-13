import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DiseaseService } from '../services/disease.service';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../assets/styles/home.component.scss']
})
export class HomeComponent implements OnInit {

  // Binding values
  public diseases: Subject<any> = new Subject<any>();
  public searchedDisease: any = null;

  // Loading values
  isFirstLoading = true;
  isLoading: boolean = false;
  isResultEmpty: boolean = false;
  isErrorPresent: boolean = false;
  isValueSearching: boolean = false;

  lastToSearch: string = "";

  constructor(private diseaseService: DiseaseService, private router: Router) { 
    
  }

  ngOnInit() {

  }

  configTranslations() {
    
  }

  displayFn(disease: any): string {
    if (disease) {
      return disease.Name;
    } else {
      return "";
    }
  }


  onInputChanged(value: string) {
    // Reset all variables
    this.isFirstLoading = false;
    this.isErrorPresent = false;
    this.isResultEmpty = false;
    this.diseases.next([]);

    // If i'm not currently searching
    if (!this.isLoading) {
      // Now I'm searching, loading!
      this.isLoading = true;

      // Send a request if value is not empty
      if (value != "") {
        this.diseaseService.searchDisease(value).subscribe((results: any) => {
          // No errors
          this.isErrorPresent = false;

          // Check for emptyness
          if (results[0]) {
            this.diseases.next(results);
            console.log(results);
          } else {
            this.diseases.next([]);
            this.isResultEmpty = true;
          }

          // Callback: check if there are pending requests
          this.isLoading = false;
          this.onSearchFinished();

        }, error => {
          // Error is present
          this.isErrorPresent = true;
          console.log(error);

          // Callback: check if there are pending requests
          this.isLoading = false;
          this.onSearchFinished();
        });
      }

      // Otherwise, just set it to empty
      else {
        this.isLoading = false;
        this.isResultEmpty = true;
        this.diseases.next([]);
      }
    } 
    
    // For now I'm busy, register the event to search
    else {
      this.lastToSearch = value;
    }
  }

  onSearchFinished() {
    if (this.lastToSearch != "") {
      this.isLoading = true;
      this.isResultEmpty = false;

      this.diseaseService.searchDisease(this.lastToSearch).subscribe((results: any) => {
        // No errors
        this.isErrorPresent = false;

        // Check for emptyness
        if (results[0]) {
          this.diseases.next(results);
          console.log(results);
        } else {
          this.diseases.next([]);
          this.isResultEmpty = true;
        }

        // Callback: check if there are pending requests
        this.lastToSearch = "";
        this.isLoading = false;

      }, error => {
        // Error is present
        this.isErrorPresent = true;
        console.log(error);

        // Callback: check if there are pending requests
        this.lastToSearch = "";
        this.isLoading = false;
      });
    }
  }

  openDisease(value: any) {
    this.router.navigate(['./disease/' + value]);
  }

  onSearchClick() {
    console.log(this.searchedDisease);
    // No object
    if (this.searchedDisease == null && this.searchedDisease == undefined) {
      this.router.navigate(['./disease-search']);
    } else {
      // Object is selected directly from list
      if (this.searchedDisease.CodDisease) {
        this.router.navigate(['./disease/' + this.searchedDisease.CodDisease]);
      } 
      
      // Object is just input
      else {
        // Must try searching
        this.isValueSearching = true;

        this.diseaseService.searchDisease(this.searchedDisease).subscribe((results: any) => {
          if (results) {
            if (results.length > 0) {
              this.router.navigate(['./disease/' + results[0].CodDisease]);
              this.isValueSearching = false;
            } else {
              this.router.navigate(['./disease-search/' + this.searchedDisease]);
            }
          }
        });
      }  
    }
  }
}
