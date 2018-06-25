import { Component, OnInit, Input } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-divbutton',
  templateUrl: './divbutton.component.html',
  styleUrls: ['../../assets/styles/divbutton.component.scss']
})
export class DivbuttonComponent implements OnInit {

  @Input() text: string;
  @Input() icon: string;
  @Input() isBordered: boolean;
  @Input() isHalfCornered: boolean;


  constructor() { }

  ngOnInit() {
  }
}
