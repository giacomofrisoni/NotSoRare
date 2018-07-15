import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SignupData } from '../models/signup-data';
import { Subject, BehaviorSubject } from 'rxjs';
import { SessionStatus } from '../models/session-status.enum';
import { GlobalUtilsService } from './global-utils.service';

@Injectable()
export class UserService {

  private isLoggedIn: BehaviorSubject<SessionStatus>;
  private userID: number = null;

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService) {
    this.isLoggedIn = new BehaviorSubject(SessionStatus.Unknown);
    this.isLoggedIn.next(SessionStatus.Unknown);
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

  getLoggedInStatus() {
    //First, make a request, for sure
    this.http.get(`${this.globalUtils.apiPath}/login` + this.globalUtils.createLanguageParameter(), {
      withCredentials: true,
    }).subscribe((response: any) => {
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

  getUserID() {
    this.getLoggedInStatus();
    return this.userID;
  }

  setUserID(userID: number) {
    this.userID = userID;
  }

  getFollowingDiseases(userID: number) {
    return this.http.get(`${this.globalUtils.apiPath}/login/`, {
      withCredentials: true
    });
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

}
