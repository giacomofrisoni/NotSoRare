import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-menubutton',
  templateUrl: './menubutton.component.html',
  styleUrls: ['../../assets/styles/menubutton.component.scss']
})
export class MenubuttonComponent implements OnInit {

  @Input() icon: string;
  @Input() badgeCount: number;

  constructor() { }

  ngOnInit() {
  }

}
