import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { CookiesUtilsService } from './cookies-utils.service';
import { Languages } from '../models/languages.enum';

@Injectable()
export class GlobalUtilsService {

  constructor(private languageService: LanguageService, private cookiesUtils: CookiesUtilsService) { }

  /**
   * All the requests begins with this path.
   */
  apiPath: string = '/api';

  /** 
   * Generates a paramenter that contains current language of the user (?lang=<language>).
   * The language is formattet as two letters (it, en, pl)
   *
   * @returns ?lang=<2-letter-language>
  */
  createLanguageParameter() {
    return "?lang=" + this.languageService.convertToStandardLanguage(this.cookiesUtils.read(Languages.LanguagesCookieName));
  }
}
