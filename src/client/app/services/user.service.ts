import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SignupData } from '../models/signup-data';

const api = '/api';


@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  signUp(signupData: SignupData) {
    return this.http.post(`${api}/signup`, {
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
      withCredentials: true
    });
  }

  login(email: string, password: string) {
    return this.http.post(`${api}/login`, {
      email: email,
      password: password
    },{
      withCredentials: true
    });
  }

  isLoggedIn() {
    return this.http.get(`${api}/login`,{
      withCredentials: true
    });
  }

  activate(email: string, activationCode: string) {
    return this.http.post(`${api}/activation`, {
      email: email,
      activationCode: activationCode
    },{
      withCredentials: true
    });
  }

  logout() {
    return this.http.post(`${api}/logout`, null, { withCredentials: true });
  }

  /*getUsers() {
    return this.http.get<Array<User>>(`${api}/users`);
  }

  deleteUser(user: User) {
    return this.http.delete(`${api}/user/${user.id}`);
  }

  addUser(user: User) {
    return this.http.post<User>(`${api}/user`, user);
  }

  updateUser(user: User) {
    return this.http.put<User>(`${api}/user/${user.id}`, user);
  }*/
}
