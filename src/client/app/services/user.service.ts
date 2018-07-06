import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SignupData } from '../models/signup-data';
import { Subject } from 'rxjs';
import { SessionStatus } from '../models/session-status.enum';
import { CookiesUtilsService } from './cookies-utils.service';
import { Languages } from '../models/languages.enum';
import { LanguageService } from './language.service';

const api = '/api';

const headers = new HttpHeaders()
  .set('Cookie', 'locale=IT');


@Injectable()
export class UserService {

  isLoggedIn: Subject<SessionStatus>;

  constructor(private http: HttpClient, private cookiesUtils: CookiesUtilsService, private languageService: LanguageService) { 
    this.isLoggedIn = new Subject();
    this.isLoggedIn.next(SessionStatus.Unknown);
  }

  signUp(signupData: SignupData) {
    return this.http.post(`${api}/signup` + this.createParameter(), {
      email: signupData.email,
      password: signupData.password,
      passwordConfirm: signupData.passwordConfirm,
      name: signupData.name,
      surname: signupData.surname,
      gender: signupData.gender,
      birthDate: signupData.birthDate,
      biography: signupData.biography,
      photo: signupData.photo,
      nationality: signupData.nationality,
      patientYN: signupData.isPatient ? "1" : "0",
      patientName: signupData.patientName,
      patientSurname: signupData.patientSurname,
      patientBirthDate: signupData.patientBirthDate,
      patientNationality: signupData.patientNationality
    },{
      withCredentials: true,
      //headers: this.createCookie()
    });
  }

  login(email: string, password: string) {
    return this.http.post(`${api}/login` + this.createParameter(), {
      email: email,
      password: password
    },{
      withCredentials: true,
      //headers: this.createCookie()
    });
  }

  getLoggedInStatus() {
    //First, make a request, for sure
    this.http.get(`${api}/login` + this.createParameter(),{
      withCredentials: true,
      //headers: this.createCookie()
    }).subscribe((response: any) =>{
      if (response.loggedIn) {
        this.isLoggedIn.next(SessionStatus.LoggedIn);
      } else {
        this.isLoggedIn.next(SessionStatus.NotLoggedIn);
      }
    }, error => {
      this.isLoggedIn.next(SessionStatus.NotLoggedIn);
    });

    //Then return the object to observe
    return this.isLoggedIn.asObservable()
  }

  activate(email: string, activationCode: string) {
    return this.http.post(`${api}/activation` + this.createParameter(), {
      email: email,
      activationCode: activationCode
    },{
      withCredentials: true,
      //headers: this.createCookie()
    });
  }

  logout() {
    return this.http.post(`${api}/logout` + this.createParameter(), null, { 
      withCredentials: true,
      //headers: this.createCookie()
    });
  }



  private createParameter() {
    return "?lang=" + this.languageService.convertToStandardLanguage(this.cookiesUtils.read(Languages.LanguagesCookieName));
  }
}
