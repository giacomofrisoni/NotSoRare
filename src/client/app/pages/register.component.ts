import { Component, OnInit } from '@angular/core';

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
  }

}
