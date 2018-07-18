import { Component, OnInit, Input } from '@angular/core';
import { NotificatorService } from '../services/notificator.service';
import { ForumService } from '../services/forum.service';

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
  @Input() moderatedSection: number = -1;

  isLoading = false;

  constructor(private forumService: ForumService) { }

  ngOnInit() {
  }

  onModerateClick(event: any) {
    if (!this.isLoading) {
      this.isLoading = true;
      this.forumService.moderateMessage(this.moderatedSection, this.threadID, this.messageID).subscribe(data => {
        console.log(data);
        this.isLoading = false;
        location.reload();
      }, error => {
        this.isLoading = false;
        console.log(error);
      })
    }

    event.stopPropagation();
  }

}
