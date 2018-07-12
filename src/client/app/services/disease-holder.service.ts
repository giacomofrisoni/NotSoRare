import { Injectable } from '@angular/core';
import { Disease } from '../models/disease';
import { Subject, BehaviorSubject } from '../../../../node_modules/rxjs';

@Injectable()
export class DiseaseHolderService {


  private disease: BehaviorSubject<Disease>;

  constructor() {
    this.disease = new BehaviorSubject(null);
    this.reset();
  }

  getDisease() {
    return this.disease;
  }

  setDisease(disease: Disease) {
    this.disease.next(disease);
  }

  reset() {
    this.disease.next(null);
  }
}
