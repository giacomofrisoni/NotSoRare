import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-radiogroup',
  templateUrl: './radiogroup.component.html',
  styleUrls: ['../../assets/styles/radiogroup.component.scss']
})
export class RadiogroupComponent implements OnInit {

  @Input() radiobuttons: any[];
  @Input() amIchecked: number = 0;
  @Output() onSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onRadioSelected(radiobutton: any): void {
    this.onSelected.emit([radiobutton]);
  }

}