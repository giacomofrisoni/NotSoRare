import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['../../assets/styles/top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  @Input() isSessionValid: boolean;

  constructor() { }

  ngOnInit() {
    this.isSessionValid = false;
  }

}
