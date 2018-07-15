import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SignupData } from '../models/signup-data';
import { Subject, BehaviorSubject } from 'rxjs';
import { SessionStatus } from '../models/session-status.enum';
import { GlobalUtilsService } from './global-utils.service';
import { CookiesUtilsService } from './cookies-utils.service';
import { UserStatus } from '../models/user-status';

@Injectable()
export class UserService {

  private userStatusChanged: Subject<boolean> = new Subject();

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService, private cookiesUtils: CookiesUtilsService) {
  }

  signUp(signupData: SignupData) {
    return this.http.post(`${this.globalUtils.apiPath}/signup` + this.globalUtils.createLanguageParameter(), {
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
    }, {
        withCredentials: true,
      });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.globalUtils.apiPath}/login` + this.globalUtils.createLanguageParameter(), {
      email: email,
      password: password
    }, {
        withCredentials: true,
      });
  }

  getLoggedInStatus(who: string) {
    return this.http.get(`${this.globalUtils.apiPath}/login` + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    });
  }

  getWatcherOfLoginChange() {
    return this.userStatusChanged.asObservable();
  }

  submitLoginChange() {
    this.userStatusChanged.next(true);
  }

  activate(email: string, activationCode: string) {
    return this.http.post(`${this.globalUtils.apiPath}/activation` + this.globalUtils.createLanguageParameter(), {
      email: email,
      activationCode: activationCode
    }, {
        withCredentials: true,
      });
  }

  logout() {
    return this.http.post(`${this.globalUtils.apiPath}/logout` + this.globalUtils.createLanguageParameter(), null, {
      withCredentials: true,
    });
  }


  getFollowingDiseases(userID: number) {
    return this.http.get(`${this.globalUtils.apiPath}/users/${userID}/interests/${this.globalUtils.createLanguageParameter()}`, {
      withCredentials: true
    });
  }

}
