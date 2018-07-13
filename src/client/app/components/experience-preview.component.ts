import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-experience-preview',
  templateUrl: './experience-preview.component.html',
  styleUrls: ['../../assets/styles/experience-preview.component.scss']
})
export class ExperiencePreviewComponent implements OnInit {

  // Inputs
  @Input() isAnonymous: boolean = true;
  @Input() isProfileButtonEnabled: boolean = false;
  @Input() name: string;
  @Input() surname: string;
  @Input() gender: string;
  @Input() birthDate: Date;
  @Input() nationality: string;
  @Input() photo: string;

  // View
  @ViewChild('defaultDiv') defaultDiv: ElementRef;
  @ViewChild('userDiv') userDiv: ElementRef;

  constructor() {
  }

  ngOnInit() {
    if (this.photo == null) {
      this.photo = "../../assets/images/default-user.png";
    }
  }

}
