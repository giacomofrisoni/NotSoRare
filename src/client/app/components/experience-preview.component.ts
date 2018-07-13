import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-experience-preview',
  templateUrl: './experience-preview.component.html',
  styleUrls: ['../../assets/styles/experience-preview.component.scss']
})
export class ExperiencePreviewComponent implements OnInit {

  @Input() isAnonymous: boolean = true;
  @Input() name: string;
  @Input() surname: string;
  @Input() gender: string;
  @Input() birthDate: Date;
  @Input() nationality: string;
  @Input() photo: string;

  constructor() {}

  ngOnInit() {
    if (this.photo == null) {
      this.photo = "../../assets/images/default-user.png";
    }
  }

}
