import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';
import { Languages } from '../models/languages.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../assets/styles/home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { 
    
  }

  ngOnInit() {

  }

  configTranslations() {
    
  }
}
