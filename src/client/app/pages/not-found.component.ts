import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['../../assets/styles/not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  public countdown: number = 5;
  timeCounter: any;
  timeTimeout: any;

  constructor(private translate: TranslateService, private router: Router) { }

  ngOnInit() {
    // Count from 5 to 0
    this.timeCounter = setInterval(() => {
      this.countdown--;
      
      if (this.countdown == 0) {
        clearInterval(this.timeCounter);
      }
    }, 1000);

    // After 5 seconds redirect to home
    this.timeTimeout = setTimeout(()=>{ 
      // Navigate to the home page
      this.router.navigate(['/home']);

      // Stop calling yourself!
      clearTimeout(this.timeTimeout);
    }, 5000);
  }

  
  ngOnDestroy() {
    clearTimeout(this.timeTimeout);
    clearInterval(this.timeCounter);
  }

}
