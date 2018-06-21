import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models/user';

const api = '/api';


@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers() {
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
  }
}
