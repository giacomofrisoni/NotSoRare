import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';
import { Languages } from '../models/languages.enum';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../assets/styles/home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('searchDisease') searchDisease: NgSelectComponent;

  constructor() { 
    
  }

  ngOnInit() {

  }

  configTranslations() {
    
  }

  searchFunction(term: string, item: any): boolean {
    this.searchDisease.loading = true;
    

    return true;
  }
}
