import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { SignupData } from '../models/signup-data';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/styles/register.component.scss']
})
export class RegisterComponent implements OnInit {

  signupData: SignupData;

  charCount: number = 0;
  isPhotoUploaded: boolean = false;
  photoUrl: string = "../..//assets/images/default-user.png";

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
    console.log(this.signupData);
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
    
      reader.onload = (event:any) => {
        this.photoUrl = event.target.result;
      }
    
      reader.readAsDataURL(event.target.files[0]);
      this.signupData.photo = event.target.files[0];
    }
  }

  onResetUrl(event: any){
    this.photoUrl = "../..//assets/images/default-user.png";
    this.signupData.photo = null;
  }

  onRegister(event: any) {
    console.log(this.signupData);
    this.userService.signUp(this.signupData).subscribe((resp: any) => {
      console.log(resp);
      console.log("Registrazione effettuata con successo");
    }, (errorResp) => {
      console.log(errorResp);
      console.log("qualcosa è andato storto");
    });
  }

  onGenderChanged(gender: string) {
    this.signupData.gender = gender;
  }

  onPatientGenderChanged(gender: string) {
    this.signupData.patientGender = gender;
  }

}
