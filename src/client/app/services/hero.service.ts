import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Hero } from '../models/hero';

const api = '/api';

const headers = new HttpHeaders()
  .set('Cookie', 'locale=it');


@Injectable()
export class HeroService {

  constructor(private http: HttpClient) { }

  getHeroes() {
    return this.http.get<Array<Hero>>(`${api}/heroes`, { headers: headers });
  }

  deleteHero(hero: Hero) {
    return this.http.delete(`${api}/hero/${hero.id}`);
  }

  addHero(hero: Hero) {
    return this.http.post<Hero>(`${api}/hero`, hero);
  }

  updateHero(hero: Hero) {
    return this.http.put<Hero>(`${api}/hero/${hero.id}`, hero);
  }
}
