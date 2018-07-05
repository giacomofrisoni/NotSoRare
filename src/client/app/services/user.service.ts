import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models/user';
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
      patientYN: signupData.isPatient,
      patientName: signupData.patientName,
      patientSurname: signupData.patientSurname,
      patientBirthDate: signupData.patientBirthDate,
      patientNationality: signupData.patientNationality
    },{
      withCredentials: true
    });
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
