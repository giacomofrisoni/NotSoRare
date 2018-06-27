import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../../assets/styles/register.component.scss']
})
export class RegisterComponent implements OnInit {

  accountTypeOptions: boolean = true;

  constructor() { }

  ngOnInit() {
    this.accountTypeOptions = true;
    $('#birthDate').datepicker();
  }

}
