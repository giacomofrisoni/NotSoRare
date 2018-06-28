import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/styles/register.component.scss']
})
export class RegisterComponent implements OnInit {

  charCount: number = 0;
  isPhotoUploaded: boolean = false;
  photoUrl: string = "../..//assets/images/default-user.png";
  isPatientAccount: boolean = true;
  radioButtons: any[] = [
    { key: "patient", value: "Paziente" },
    { key: "family", value: "Famigliare" }
  ];


  constructor() {
  }

  ngOnInit() {
  }

  onAccountTypeSelected(radiobutton: any) {
    this.isPatientAccount = (radiobutton == this.radioButtons[0]);
  }

  readUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
    
      reader.onload = (event:any) => {
        this.photoUrl = event.target.result;
        console.log(event.target.result);
      }
    
      reader.readAsDataURL(event.target.files[0]);
    }
  }

}
