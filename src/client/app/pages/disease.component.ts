import { Component, OnInit, ViewChild } from '@angular/core';
import { DiseaseService } from '../services/disease.service';
import { TranslateService } from '@ngx-translate/core';
import { Disease } from '../models/disease';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { DiseaseHolderService } from '../services/disease-holder.service';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { DivbuttonComponent } from '../components/divbutton.component';

@Component({
  selector: 'app-disease',
  templateUrl: './disease.component.html',
  styleUrls: ['../../assets/styles/disease.component.scss']
})
export class DiseaseComponent implements OnInit {


  // View
  @ViewChild('followButton') followButton: DivbuttonComponent;
  @ViewChild('unfollowButton') unfollowButton: DivbuttonComponent;

  // Loading
  userLoggedIn: number = -1;
  isDiseaseLoaded: boolean = false;
  isDiseaseFollowed: boolean = false;
  isDiseaseFollowedLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;
  isModerator = false;
  loadingTimes: number = 0;

  // Disease object
  disease: Disease;

  // Subscriptions to destroy
  subLanguageService: Subscription;
  subParams: Subscription;
  subUserService: Subscription;
  subDiseaseService: Subscription;

  constructor(
    private diseaseService: DiseaseService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private userService: UserService,
    private languageService: LanguageService,
    private diseaseHolder: DiseaseHolderService) {
    this.disease = new Disease();
  }

  ngOnInit() {
    // Subscribe to change language
    this.subLanguageService = this.languageService.getCurrentLanguage().subscribe(newLanguage => {
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
        this.subDiseaseService = this.diseaseService.getDisease(params['id']).subscribe((disease: Disease) => {
          // Data are ok, set it!
          this.disease = disease;

          // Inform the view
          this.isDiseaseLoaded = true;
          this.isAnyErrorPresent = false;

          // Load more data!
          this.subUserService = this.userService.getLoggedInStatus("Disease").subscribe((user: any) => {
            // Admin cannot access
            if (!user.codDisease) {
              // Check if user is logged in
              this.userLoggedIn = user.loggedIn ? user.loggedIn : -1;

              // Check if he's an admin
              if (user.codDisease) {
                this.isModerator = true;
              }

              if (this.userLoggedIn >= 0) {
                // If it's logged check if he's following this disease
                this.userService.getFollowingDiseases(this.userLoggedIn).subscribe((results: any[]) => {
                  results.forEach(result => {
                    if (result.CodDisease == id) {
                      this.isDiseaseFollowed = true;
                    }
                  });

                  //Finally all is loaded
                  this.isDiseaseFollowedLoaded = true;
                  this.diseaseHolder.setDisease(this.disease);
                }, error => {
                  console.log("Error during getting following diseases:");
                  console.log(error);
                  this.isDiseaseFollowedLoaded = false;
                });
              } else {
                //Finally all is loaded
                this.isDiseaseFollowedLoaded = true;
                this.diseaseHolder.setDisease(this.disease);
              }
            } else {
              this.isModerator = true;
              this.userLoggedIn = -1;
              this.isDiseaseLoaded = true;
            }
          }, error => {
            console.log("Error during check user logged in: " + error);
            this.userLoggedIn = -1;
          });

        }, error => {
          // Inform the view
          this.isDiseaseLoaded = true;
          this.isAnyErrorPresent = true;

          console.log("Error during loading disease: " + error);
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
    if (this.subLanguageService) this.subLanguageService.unsubscribe();
    if (this.subParams) this.subParams.unsubscribe();
    if (this.subUserService) this.subUserService.unsubscribe();
    if (this.subDiseaseService) this.subDiseaseService.unsubscribe();
  }

  onFollow() {
    this.followButton.icon = "fa fa-spinner fa-spin";
    this.followButton.text = "";

    this.diseaseService.followDisease(this.userLoggedIn, this.disease.general.CodDisease).subscribe(results => {
      this.isDiseaseFollowed = true;
      this.followButton.icon = "fa fa-plus-circle";
      this.followButton.text = "Segui";
    }, error => {
      this.followButton.icon = "fa fa-plus-circle";
      this.followButton.text = "Segui";
      console.log("Impossible to follow: " + error);
      console.log(error);
    });
  }

  onUnfollow() {
    this.unfollowButton.icon = "fa fa-spinner fa-spin";
    this.unfollowButton.text = "";

    this.diseaseService.unfollowDisease(this.userLoggedIn, this.disease.general.CodDisease).subscribe(results => {
      this.isDiseaseFollowed = false;
      this.unfollowButton.icon = "fa fa-minus-circle";
      this.unfollowButton.text = "Smetti di seguire";
    }, error => {
      this.unfollowButton.icon = "fa fa-minus-circle";
      this.unfollowButton.text = "Smetti di seguire";
      console.log("Impossible to follow: " + error);
      console.log(error);
    });
  }

}
