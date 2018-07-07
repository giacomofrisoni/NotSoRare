import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DiseaseService } from '../services/disease.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../assets/styles/home.component.scss']
})
export class HomeComponent implements OnInit {

  // View components
  @ViewChild('searchDisease') searchDisease: NgSelectComponent;

  // Binding values
  public diseases: Subject<any> = new Subject<any>();

  // Loading values
  isFirstLoading = true;
  isLoading: boolean = false;
  isResultEmpty: boolean = false;
  isErrorPresent: boolean = false;

  lastToSearch: string = "";

  constructor(private diseaseService: DiseaseService) { 
    
  }

  ngOnInit() {

  }

  configTranslations() {
    
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
}
