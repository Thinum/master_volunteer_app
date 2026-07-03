import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ForumEntry } from '../../../../models/forum-entry.model';
import { ForumReply } from '../../../../models/forum-reply.model';
import { User } from '../../../../models/user.model';
import { ForumService } from '../../../../services/api/forum.service';
import { VolunteerService } from '../../../../services/api/volunteer.service';

@Component({
  selector: 'app-forum-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './forum-detail.component.html',
  styleUrl: './forum-detail.component.css'
})
export class ForumDetailComponent implements OnInit {
  forum?: ForumEntry;
  isLoading = true;
  newReply = '';
  replies: ForumReply[] = [];
  currentUser?: User;

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    const forumId = Number(this.route.snapshot.paramMap.get('id'));

    this.volunteerService.getCurrentUser().subscribe({
      next: user => this.currentUser = user,
      error: () => this.currentUser = undefined
    });

    this.forumService.getForumEntryById(forumId).subscribe(forum => {
      this.forum = forum;
      this.isLoading = false;
      if (forum?.id) {
        this.loadReplies(forum.id);
      }
    });
  }

  addReply(): void {
    const message = this.newReply.trim();
    if (!message) {
      return;
    }

    const forumEntryId = this.forum?.id;
    if (!forumEntryId) {
      return;
    }

    const author = this.currentUser?.name || this.currentUser?.username || 'Volunteer';
    const avatar = this.currentUser?.profilePicture || `https://api.dicebear.com/9.x/lorelei/svg/seed=${author}`;

    this.forumService.createReply(forumEntryId, message, author, avatar).subscribe(reply => {
      this.replies = [...this.replies, reply];
      this.newReply = '';
    });
  }

  private loadReplies(forumEntryId: number): void {
    this.forumService.getReplies(forumEntryId).subscribe(replies => {
      this.replies = replies;
    });
  }
}
