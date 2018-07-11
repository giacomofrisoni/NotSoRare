import { Component, OnInit } from '@angular/core';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['../../assets/styles/not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  public countdown: number = 5;

  constructor(private translate: TranslateService, private router: Router) { }

  ngOnInit() {
    // Count from 5 to 0
    var counter = setInterval(() => {
      this.countdown--;
      
      if (this.countdown == 0) {
        clearInterval(counter);
      }
    }, 1000);

    // After 5 seconds redirect to home
    var timeout = setTimeout(()=>{ 
      // Navigate to the home page
      this.router.navigate(['/home']);

      // Stop calling yourself!
      clearTimeout(timeout);
    }, 5000);
  }

}
