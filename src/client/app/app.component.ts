import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Heroes</h1>
    <app-heroes></app-heroes>
  `,
  styles: []
})

export class AppComponent {
  title = 'app';
}
