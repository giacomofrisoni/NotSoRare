import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-forum-thread-view',
  templateUrl: './forum-thread-view.component.html',
  styleUrls: ['../../assets/styles/forum-thread-view.component.scss']
})
export class ForumThreadViewComponent implements OnInit {

  @Input() image: any;
  @Input() author: string;
  @Input() pastTime: any;
  @Input() title: string = "";
  @Input() content: string;
  @Input() isMessage: boolean = false;
  @Input() isAnonymous: boolean = false;

  constructor() { }

  ngOnInit() {
    console.log(this.author);
  }

}
