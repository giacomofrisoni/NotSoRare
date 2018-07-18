import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ProfileHolderService {

  private profileData: BehaviorSubject<any>;

  constructor() {
    this.profileData = new BehaviorSubject(null);
    this.reset();
  }

  getCurrentProfileData() {
    return this.profileData;
  }

  setCurrentProfileData(currentUserID: number, requestedUserID: number) {
    this.profileData.next({
      currentUserID: currentUserID,
      requestedUserID: requestedUserID
    });
  }

  reset() {
    this.profileData.next(null);
  }
}
