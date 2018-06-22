import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-divbutton',
  //inputs: ['text', 'icon', 'isSmall', 'isNotifyBadgeSet'],
  templateUrl: './divbutton.component.html',
  styleUrls: ['../../assets/styles/divbutton.component.scss']
})
export class DivbuttonComponent implements OnInit {

  @Input() text: string;
  @Input() icon: string;
  @Input() badgeCount: string;
  @Input() isIconic: boolean;
  @Input() isNotifyBadgeSet: boolean;
  @Input() isBordered: boolean;

  constructor() { }

  ngOnInit() {
  }

}
