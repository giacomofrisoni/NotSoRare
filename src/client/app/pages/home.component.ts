import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DiseaseService } from '../services/disease.service';
import { Router } from '../../../../node_modules/@angular/router';
import { UserService } from '../services/user.service';
import { SessionStatus } from '../models/session-status.enum';

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
  isPageLoading: boolean = true;
  isUserLoggedIn: boolean = false;
  isLoading: boolean = false;
  isValueNotFound: boolean = false;
  isErrorPresent: boolean = false;
  isValueSearching: boolean = false;

  lastToSearch: string = "";
  followedDiseases: any[];

  constructor(private diseaseService: DiseaseService, private router: Router, private userService: UserService) { 
    
  }

  ngOnInit() {
    this.userService.getLoggedInStatus().subscribe(loginStatus => {
      this.isUserLoggedIn = (loginStatus == SessionStatus.LoggedIn ? true : false);

      if (this.isUserLoggedIn) {
        // Get the followed diseases
        
        // Finally, tell that is finished loading
        this.isPageLoading = false;
      } else {
        // Not logged, default one
        this.isPageLoading = false;
      }
    });
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
    this.isErrorPresent = false;
    this.isValueNotFound = false;
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
            this.isValueNotFound = true;
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
        this.isErrorPresent = false;
        this.isValueNotFound = false;
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
      // Reset all variables
      this.isLoading = true;
      this.isErrorPresent = false;
      this.isValueNotFound = false;
      this.diseases.next([]);

      this.diseaseService.searchDisease(this.lastToSearch).subscribe((results: any) => {
        // No errors
        this.isErrorPresent = false;

        // Check for emptyness
        if (results[0]) {
          this.diseases.next(results);
          console.log(results);
        } else {
          this.diseases.next([]);
          this.isValueNotFound = true;
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
    } else {
      this.isLoading = false;
      this.isErrorPresent = false;
      this.isValueNotFound = false;
      this.diseases.next([]);
    }
  }

  openDisease(value: any) {
    this.router.navigate(['./disease/' + value]);
  }

  openAllDiseases(){
    this.router.navigate(['./disease-search/' + this.searchedDisease]);
  }

  onSearchClick() {
    this.isValueNotFound = false;


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
              this.isValueNotFound = true;
            }
          }
        });
      }  
    }
  }
}
