import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-forum-thread-view',
  templateUrl: './forum-thread-view.component.html',
  styleUrls: ['../../assets/styles/forum-thread-view.component.scss']
})
export class ForumThreadViewComponent implements OnInit {

  @Input() messageID: number = -1;
  @Input() threadID: number = -1;
  @Input() image: any;
  @Input() author: string;
  @Input() pastTime: any;
  @Input() title: string = "";
  @Input() content: string;
  @Input() isMessage: boolean = false;
  @Input() isAnonymous: boolean = false;
  @Input() isModerator: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  onModerateClick(event: any) {
    console.log("moderate this shit" + this.messageID + " / " + this.threadID);
    event.stopPropagation();
  }

}
