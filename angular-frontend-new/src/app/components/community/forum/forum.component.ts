import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ForumEntry {
  id: string;
  title: string;
  lastMessage: string;
  lastEdited: Date;
  icon: string;
  newPosts?: number;
}

@Component({
  selector: 'app-forum',
  standalone: true, // Assuming standalone components; adjust if using NgModule
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, MatButtonModule, MatIconModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent {
  searchTerm: string = '';
  activities: ForumEntry[] = [ // Mock data; replace with service fetch
    {
      id: '1',
      title: 'Community Garden Project',
      lastMessage: 'Looking for volunteers to help plant native flowers this weekend!',
      lastEdited: new Date('2025-10-01'),
      icon: 'https://avatar.iran.liara.run/public/1',
      newPosts: 5
    },
    {
      id: '2',
      title: 'Local Library Reading Program',
      lastMessage: 'Does anyone have experience organizing story time for kids aged 6–10?',
      lastEdited: new Date('2025-09-28'),
      icon: 'https://avatar.iran.liara.run/public/2',
    },
    {
      id: '3',
      title: 'Beach Cleanup Initiative',
      lastMessage: 'We collected 200kg of waste last month! Next meetup: Saturday at 9 AM.',
      lastEdited: new Date('2025-10-03'),
      icon: 'https://avatar.iran.liara.run/public/3',
      newPosts: 2
    }
  ];

  get filteredForums(): ForumEntry[] {
    if (!this.searchTerm) return this.activities;
    return this.activities.filter(forum =>
      forum.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addNew(): void {
    console.log('Navigate to create new forum entry'); // Extend: e.g., router.navigate(['/forum/create'])
  }
}
