import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from '../../../../node_modules/rxjs';
import { DiseaseService } from '../services/disease.service';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['../../assets/styles/search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  @Output() onSearchClicked: EventEmitter<any> = new EventEmitter();
  @Output() onResultClicked: EventEmitter<any> = new EventEmitter();

  // Binding values
  private diseases: Subject<any> = new Subject<any>();
  public searchedDisease: any = null;

  // Loading values
  private isLoading: boolean = false;
  private isResultEmpty: boolean = false;
  private isErrorPresent: boolean = false;
  
  lastToSearch: string = "";

  // Search results
  searchResults: any[] = new Array();

  constructor(private diseaseService: DiseaseService) { }

  ngOnInit() {

  }


  onInputChanged(value: string) {
    // Reset all variables
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

  resultClicked(value: any) {
    this.onResultClicked.emit([value]);
  }


  searchClicked() {
    this.onSearchClicked.emit([this.searchedDisease]);
  }

}
