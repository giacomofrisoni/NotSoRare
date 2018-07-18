import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SignupData } from '../models/signup-data';
import { Subject, BehaviorSubject } from 'rxjs';
import { GlobalUtilsService } from './global-utils.service';
import { CookiesUtilsService } from './cookies-utils.service';
import { User } from '../models/user';

@Injectable()
export class UserService {

  private userStatusChanged: Subject<boolean> = new Subject();

  constructor(private http: HttpClient, private globalUtils: GlobalUtilsService, private cookiesUtils: CookiesUtilsService) {
  }

  signUp(signupData: SignupData) {
    if (signupData.biography && signupData.biography != "") {
      return this.http.post(`${this.globalUtils.apiPath}/signup` + this.globalUtils.createLanguageParameter(), {
        email: signupData.email,
        password: signupData.password,
        passwordConfirm: signupData.passwordConfirm,
        name: signupData.name,
        surname: signupData.surname,
        gender: signupData.gender,
        birthDate: signupData.birthDate,
        biography: signupData.biography,
        photoContentType: signupData.photoContentType,
        photoData: signupData.photoData,
        nationality: signupData.nationality,
        patientYN: signupData.isPatient ? "1" : "0",
        patientName: signupData.patientName,
        patientSurname: signupData.patientSurname,
        patientBirthDate: signupData.patientBirthDate,
        patientNationality: signupData.patientNationality
      }, {
          withCredentials: true,
        });
    } else {
      return this.http.post(`${this.globalUtils.apiPath}/signup` + this.globalUtils.createLanguageParameter(), {
        email: signupData.email,
        password: signupData.password,
        passwordConfirm: signupData.passwordConfirm,
        name: signupData.name,
        surname: signupData.surname,
        gender: signupData.gender,
        birthDate: signupData.birthDate,
        photoContentType: signupData.photoContentType,
        photoData: signupData.photoData,
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

  }

  changeProfileVisibility(user: User, isAnonymous: boolean) {
    return this.http.put(`${this.globalUtils.apiPath}/users/${user.id}/` + this.globalUtils.createLanguageParameter(), {
      email: user.Email,
      name: user.Name,
      surname: user.Surname,
      gender: user.Gender,
      birthDate: user.BirthDate,
      biography: user.Biography,
      nationality: user.Nationality,
      isAnonymous: isAnonymous? 1 : 0,
      photoContentType: this.getPhotoContentType(user.Photo),
      photoData: this.getPhotoContentData(user.Photo),
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

  moderatorLogin(email: string, password: string) {
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

  getUserData(userID: number) {
    return this.http.get(`${this.globalUtils.apiPath}/users/${userID}/${this.globalUtils.createLanguageParameter()}`, {
      withCredentials: true
    });
  }

  getUserThreads(userID: number) {
    return this.http.get(`${this.globalUtils.apiPath}/users/${userID}/forumThreads/${this.globalUtils.createLanguageParameter()}`, {
      withCredentials: true
    });
  }

  getUserExperiences(userID: number) {
    return this.http.get(`${this.globalUtils.apiPath}/users/${userID}/experiences/${this.globalUtils.createLanguageParameter()}`, {
      withCredentials: true
    });
  }

  private getPhotoContentType(photo: any) {
    return photo.split(/:|;/)[1];
  }

  private getPhotoContentData(photo: any) {
    return photo.split(',')[1];
  }
}
