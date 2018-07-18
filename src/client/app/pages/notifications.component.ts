import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { NotificatorService } from '../services/notificator.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['../../assets/styles/notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  // Loading
  isNotificationsLoaded = false;
  isNotificationsEmpty = false;
  isAnyErrorPresent = false;
  isUserLoggedIn = false;

  // Binding
  notifications: any[];

  constructor(private userService: UserService, private notificator: NotificatorService) { }

  ngOnInit() {
    this.userService.getLoggedInStatus("Notifications").subscribe((user: any) => {
      // Only if logged in
      if (user.loggedIn) {
        this.isUserLoggedIn = true;

        // Take all notifications
        this.notificator.getAllNotifications(user.loggedIn).subscribe((notifications: any[]) => {
          if (notifications) {
            if (notifications.length > 0) {
              // Data ok
              this.notifications = notifications;
            } else {
              // Data empty
              this.isNotificationsEmpty = true;
            }
          } else {
            // Unexpected data
            this.isAnyErrorPresent = true;
          }

          this.isNotificationsLoaded = true;
        }, error => {
          // Error when retriving notifications
          this.isNotificationsLoaded = true;
          this.isAnyErrorPresent = true;
          console.log(error);
        });
      } else {
        // User not logged in
        this.isUserLoggedIn = false;
        this.isNotificationsLoaded = true;
      }
    }, error => {
      // Error getting user login status
      this.isNotificationsLoaded = true;
      this.isAnyErrorPresent = true;
      console.log(error);
    });

  }

}
