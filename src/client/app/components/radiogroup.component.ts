import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-radiogroup',
  templateUrl: './radiogroup.component.html',
  styleUrls: ['../../assets/styles/radiogroup.component.scss']
})
export class RadiogroupComponent implements OnInit {

  @Input() radiobuttons: any[];
  @Output() onSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    console.log(this.radiobuttons);
  }

  onRadioSelected(radiobutton: any): void {
    this.onSelected.emit([radiobutton]);
  }

}