import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Interface for 1:1 conversations
interface ChatConversation {
  id: number;
  contact: string; // e.g., friend's name
  avatar?: string; // Contact avatar URL
  lastMessage: string; // Preview of last message
  timestamp: Date; // Last message time
  unreadCount?: number; // Optional unread messages
  isActive?: boolean; // For status indicator (e.g., online)
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, MatButtonModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  searchTerm: string = '';

  conversations: ChatConversation[] = [
    // Sample 1:1 convos; fetch from service (e.g., this.chatService.getConversations())
    {
      id: 1,
      contact: 'Alice',
      avatar: 'https://avatar.iran.liara.run/public/1',
      lastMessage: 'Hey, have you tried the new Angular signals? They\'re amazing for reactivity!',
      timestamp: new Date('2025-10-04T14:00:00'),
      unreadCount: 2,
      isActive: true
    },
    {
      id: 2,
      contact: 'Bob',
      avatar: 'https://avatar.iran.liara.run/public/3',
      lastMessage: 'Let\'s catch up later—free this weekend?',
      timestamp: new Date('2025-10-04T12:30:00'),
      unreadCount: 0,
      isActive: false
    },
    {
      id: 3,
      contact: 'Charlie',
      avatar: 'https://avatar.iran.liara.run/public/2',
      lastMessage: 'Thanks for the code review tips!',
      timestamp: new Date('2025-10-03T16:45:00'),
      unreadCount: 1,
      isActive: true
    }
    // Add more...
  ];

  get filteredConversations(): ChatConversation[] {
    if (!this.searchTerm) return this.conversations;
    const term = this.searchTerm.toLowerCase();
    return this.conversations.filter(convo =>
      convo.contact.toLowerCase().includes(term) ||
      convo.lastMessage.toLowerCase().includes(term)
    );
  }

  onNewChat(): void {
    // TODO: Open modal/contact selector or navigate to new chat creation
    console.log('Start new 1:1 conversation');
    // e.g., this.router.navigate(['/chat/new']);
  }

  shortenText(text: string, maxLength: number = 60): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
