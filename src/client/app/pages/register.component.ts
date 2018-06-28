import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/styles/register.component.scss']
})
export class RegisterComponent implements OnInit {

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

}
