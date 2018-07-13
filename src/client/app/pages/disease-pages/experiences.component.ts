import { Component, OnInit } from '@angular/core';
import { ExperiencePreview } from '../../models/experience-preview';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['../../../assets/styles/experiences.component.scss']
})
export class ExperiencesComponent implements OnInit {

  // Loading
  isExperiencesLoaded: boolean = false;
  isAnyErrorPresent: boolean = false;

  // Binding
  experiences: ExperiencePreview[] = new Array();


  constructor() { }

  ngOnInit() {
    
  }

}
