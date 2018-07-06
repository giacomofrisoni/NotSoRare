import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { SignupData } from '../models/signup-data';
import * as $ from 'jquery';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/styles/register.component.scss']
})
export class RegisterComponent implements OnInit {

  signupData: SignupData;

  readonly photoMaxSize: number = 1048576;  // 1 Mb (1048576 bytes)
  readonly photoSupportedTypes: string[] = ['image/png', 'image/jpeg'];

  charCount: number = 0;
  isPhotoUploaded: boolean = false;
  photoUrl: string = "../..//assets/images/default-user.png";
  errors: any = {};

  radioButtons: any[] = [
    { key: "patient", value: "Paziente" },
    { key: "family", value: "Famigliare" }
  ];


  constructor(private userService: UserService) {
    this.signupData = new SignupData();
  }

  ngOnInit() {
    this.signupData = new SignupData();
    this.signupData.isPatient = true;
  }

  onTextareaValueChange($event) {
    this.charCount = $event.target.value.length;
  }

  onAccountTypeSelected(radiobutton: any) {
    this.signupData.isPatient = (radiobutton == this.radioButtons[0]);
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
        const base64string = event.target.result.split(',')[1];
        this.signupData.photo = base64string;
      }

      const file = event.target.files[0];

      // Checks file dimension
      if (file.size > this.photoMaxSize) {
        alert(file.size + " bytes\nToo big!");
      } else {
        // Checks file type
        if (this.photoSupportedTypes.includes(file.type)) {
          /**
           * Converts the file contents to a base64-encoded string which can be used as an
           * image data URI for the src attribute.
           */
          reader.readAsDataURL(file);
        } else {
          alert('Unsupported file type!');
        }
      }
    }
  }

  onResetUrl(event: any){
    this.photoUrl = "../..//assets/images/default-user.png";
    this.signupData.photo = null;
  }

  onRegister(event: any) {
    console.log(this.signupData);
    $(".error").removeClass("error");

    this.userService.signUp(this.signupData).subscribe((resp: any) => {
      console.log(resp);
      console.log("Registrazione effettuata con successo");
    }, (errorResp) => {
      // Some error occurred
      this.errors = {};

      // If there are errors related with inputs
      if (errorResp.error.errors != null && errorResp.error.errors != undefined) {
        //Foreach error
        errorResp.error.errors.forEach(element => {
          //The field will be RED
          $("#" + element.field[0]).addClass("error");

          //And the error message will display
          this.errors[element.field[0]] = element.messages[0];
        });
      }

      if (errorResp.error.error != null && errorResp.error.error != undefined) {
        errorResp.error.errors.forEach(element => {
          this.errors.push(element.messages[0]);
        });
      }

      console.log(errorResp.error.errors);
      console.log(this.errors);

    });
  }

  onGenderChanged(gender: string) {
    this.signupData.gender = gender;
  }

  onPatientGenderChanged(gender: string) {
    this.signupData.patientGender = gender;
  }

}
