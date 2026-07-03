import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ForumEntry } from '../../../models/forum-entry.model';
import { ForumService } from '../../../services/api/forum.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, MatButtonModule, MatIconModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  searchTerm: string = '';
  activities: ForumEntry[] = [];

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.forumService.getForumEntries().subscribe(entries => {
      this.activities = entries;
    });
  }

  get filteredForums(): ForumEntry[] {
    if (!this.searchTerm) return this.activities;
    return this.activities.filter(forum =>
      forum.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addNew(): void {
    this.forumService.createForumEntry({
      title: 'New community topic',
      lastMessage: 'Draft a first message for this topic.',
      lastEdited: new Date(),
      icon: 'https://api.dicebear.com/9.x/lorelei/svg/seed=new-topic',
      newPosts: 1
    }).subscribe(entry => {
      this.activities = [entry, ...this.activities];
    });
  }
}
