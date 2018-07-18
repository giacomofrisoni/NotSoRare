import { Component, OnInit } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { DiseaseService } from '../services/disease.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { SessionStatus } from '../models/session-status.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../assets/styles/home.component.scss']
})
export class HomeComponent implements OnInit {

  // Binding values
  diseases: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  searchedDisease: any = null;

  lastToSearch: string = "";
  followedDiseases: any[];

  // Loading values
  isPageLoading: boolean = true;
  isUserLoggedIn: boolean = false;
  isLoading: boolean = false;
  isValueNotFound: boolean = false;
  isErrorPresent: boolean = false;
  isValueSearching: boolean = false;
  isModerator = false;

  isFollowedDiseasesLoaded: boolean = false;
  isFollowedDiseasesError: boolean = false;





  constructor(
    private diseaseService: DiseaseService,
    private router: Router,
    private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getLoggedInStatus("home").subscribe((user: any) => {
      // Admin cannot access
      if (!user.codDisease) {
        // Is user logged in?
        this.isUserLoggedIn = (user.loggedIn ? true : false);

        if (this.isUserLoggedIn) {
          // Get his followed diseases
          this.userService.getFollowingDiseases(user.loggedIn).subscribe((results: any[]) => {
            // If results are correct
            if (results) {
              // Save them
              this.followedDiseases = results;
            } else {
              // Error when retriving diseases
              this.isFollowedDiseasesError = true;
            }

            //Anyway, you've finished
            this.isFollowedDiseasesLoaded = true;

          }, error => {
            // Error when retriving diseases
            console.log(error);
            this.isFollowedDiseasesLoaded = true;
          });

          // Finally, tell that is finished loading
          this.isPageLoading = false;
        } else {
          // Not logged, default one
          this.isPageLoading = false;
        }
      } else {
        this.isPageLoading = false;
        this.isUserLoggedIn = false;
        this.isModerator = true;
      }
    });
  }

  openDisease(value: any) {
    this.router.navigate(['./disease/' + value]);
  }

  openAllDiseases() {
    this.router.navigate(['./disease-search']);
  }

  onSearchClick(value: any) {
    this.isValueNotFound = false;

    // No object
    if (value == null && value == undefined) {
      this.router.navigate(['./disease-search']);
    } else {
      // Object is selected directly from list
      if (value.CodDisease) {
        this.router.navigate(['./disease/' + value.CodDisease]);
      }

      // Object is just input
      else {
        // Must try searching
        this.isValueSearching = true;

        this.diseaseService.searchDisease(value).subscribe((results: any) => {
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

  isLoadingChanged(value: boolean) {
    this.isLoading = value;
  }
}

