import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { SignupData } from '../models/signup-data';
import * as $ from 'jquery';
import { DivbuttonComponent } from '../components/divbutton.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { SimpleDialogType } from '../dialogs/simple-dialog-type.enum';
import { SimpleDialogComponent } from '../dialogs/simple-dialog.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/styles/register.component.scss']
})
export class RegisterComponent implements OnInit {

  // View components
  @ViewChild('registerButton') registerButton: DivbuttonComponent;

  signupData: SignupData;

  readonly photoMaxSize: number = 1048576;  // 1 Mb (1048576 bytes)
  readonly photoSupportedTypes: string[] = ['image/png', 'image/jpeg'];

  charCount: number = 0;
  isPhotoUploaded: boolean = false;
  photoUrl: string = "../..//assets/images/default-user.png";
  errors: any = {};
  translations: any = {};

  constructor(private userService: UserService, private dialog: MatDialog, private router: Router, private translate: TranslateService, private languageService: LanguageService) {
    this.signupData = new SignupData();
  }

  ngOnInit() {
    this.signupData = new SignupData();
    this.signupData.isPatient = true;


    this.languageService.getCurrentLanguage().subscribe(language =>{
      this.translate.get([
        "Register.ConfirmRegistrationTitle",
        "Register.ConfirmRegistrationText",
        "Register.ErrorTitle", 
        "Register.ErrorInvalidData",
        "Register.ErrorGeneric",
        "Register.ErrorPhoto",
        "Register.ErrorPhotoFormat",
        "Register.ErrorName",
        "Register.ErrorSurname",
        "Register.ErrorBirthDate",
        "Register.ErrorNationality",
        "Register.ErrorGender",
        "Register.ErrorPassword",
        "Register.ErrorPasswordConfirm",
        "Register.ErrorEmail"
      ]).subscribe((results: any) => {
        for(let key in results) {
          this.translations[key.split(".")[1]] = results[key]
        }
      });
    });
  }

  onTextareaValueChange($event) {
    this.charCount = $event.target.value.length;
  }

  onAccountTypeSelected(radiobutton: any) {
    this.signupData.isPatient = (radiobutton.key == "patient");
  }

  onCountrySelected(country: any) {
    this.signupData.nationality = country;
  }

  onCountrySelectedP(country: any) {
    this.signupData.patientNationality = country;
  }

  onReadUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
    
      reader.onloadend = (event:any) => {
        this.photoUrl = event.target.result;
        this.signupData.photoContentType = event.target.result.split(/:|;/)[1];
        this.signupData.photoData = event.target.result.split(',')[1];
      }

      const file = event.target.files[0];

      // Checks file dimension
      if (file.size > this.photoMaxSize) {
        this.openDialog(
          this.translations.ErrorTitle,
          this.translations.ErrorPhoto,
          SimpleDialogType.Error
        );
      } else {
        // Checks file type
        if (this.photoSupportedTypes.includes(file.type)) {
          /**
           * Converts the file contents to a base64-encoded string which can be used as an
           * image data URI for the src attribute.
           */
          reader.readAsDataURL(file);
        } else {
          this.openDialog(
            this.translations.ErrorTitle,
            this.translations.ErrorPhotoformat,
            SimpleDialogType.Error
          );
        }
      }
    }
  }

  onResetUrl(event: any){
    this.photoUrl = "../..//assets/images/default-user.png";
    this.signupData.photoContentType = null;
    this.signupData.photoData = null;
  }

  onRegister(event: any) {
    // Start loading, removing all previous errors
    this.registerButton.icon = "fa fa-spinner fa-spin";
    $(".error").removeClass("error");

    this.userService.signUp(this.signupData).subscribe((resp: any) => {
      // Ok, loading finished - completed!
      this.registerButton.icon = "";

      //Open confirmation dialog!
      this.openDialog(
        this.translations.ConfirmRegistrationTitle,
        this.translations.ConfirmRegistrationText,
        SimpleDialogType.Confirm,
        () => { this.router.navigate(['./login']); } 
      );


    }, (errorResp) => {
      // Ok, loading finished due error
      this.registerButton.icon = "";

      console.log("Register failed:");
      console.log(errorResp);

      // Some error occurred
      this.errors = {};

      // If there are errors related with inputs
      if (errorResp.error != null && errorResp.error != undefined) {
        // Foreach error
        for (let key in errorResp.error) {
          // Give that error
          $("#" + key).addClass("error");
          this.errors[key] = this.translations["Error" + this.capitalizeFirstLetter(key)];
        }
      }

      this.openDialog(
        this.translations.ErrorTitle,
        this.translations.ErrorInvalidData,
        SimpleDialogType.Error
      );

    });
  }

  onGenderChanged(gender: string) {
    this.signupData.gender = gender;
  }

  onPatientGenderChanged(gender: string) {
    this.signupData.patientGender = gender;
  }


  private openDialog(title: string, text: string, type: SimpleDialogType, action: any = null) {
    const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
          title: title,
          text: text,
          type: type,
          isAlterEnabled: false,
          mainButtonText: "OK",
        };
    
        let instance = this.dialog.open(SimpleDialogComponent, dialogConfig);
        instance.afterClosed().subscribe(event =>{
          if (action != null) {
            action();
          }
        });
  }

  private capitalizeFirstLetter(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

}
