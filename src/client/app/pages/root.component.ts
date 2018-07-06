import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';
import { Languages } from '../models/languages.enum';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['../../assets/styles/root.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RootComponent implements OnInit {

  subLanguageService: Subscription;

  constructor(private translate: TranslateService, private languageService: LanguageService) { 
    // Set default language and try to retrive the right one
    this.translate.setDefaultLang(Languages.English);
    this.subLanguageService = this.languageService.getCurrentLanguage().subscribe(language => {
      this.translate.use(language);
    });
  }

  ngOnInit() {
  }

}
