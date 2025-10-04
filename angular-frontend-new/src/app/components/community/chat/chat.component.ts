import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Simple interface for messages (extend for attachments, etc.)
interface ChatMessage {
  id: number;
  sender: string; // e.g., username
  avatar?: string; // Optional avatar URL
  text: string;
  timestamp: Date;
  isCurrentUser: boolean; // For alignment
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, MatButtonModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked {
  searchTerm: string = '';
  @ViewChild('chatContainer') private chatContainer!: ElementRef<HTMLDivElement>;

  threadId: number = 0; // From route, e.g., forum entry ID
  messages: ChatMessage[] = [
    // Sample data; fetch from service based on threadId
    {
      id: 1,
      sender: 'Alice',
      avatar: 'https://avatar.iran.liara.run/public/1',
      text: 'Hey, great topic on Angular best practices! Have you tried signals yet?',
      timestamp: new Date('2025-10-03T10:00:00'),
      isCurrentUser: false
    },
    {
      id: 2,
      sender: 'You', // Current user
      avatar: 'https://avatar.iran.liara.run/public/2',
      text: 'Yes, signals are a game-changer for reactivity. Check out this example...',
      timestamp: new Date('2025-10-03T10:05:00'),
      isCurrentUser: true
    },
    {
      id: 3,
      sender: 'Bob',
      avatar: 'https://avatar.iran.liara.run/public/3',
      text: 'I agree, but lazy loading routes still trips me up sometimes.',
      timestamp: new Date('2025-10-03T10:10:00'),
      isCurrentUser: false
    }
    // Add more...
  ];
  newMessage: string = '';
  isTyping: boolean = false; // For typing indicator

  constructor(private route: ActivatedRoute) {
    this.threadId = Number(this.route.snapshot.paramMap.get('id')) || 1;
    // TODO: Load real messages via service, e.g., this.chatService.getMessages(this.threadId)
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now(), // Temp ID; use real one from backend
        sender: 'You',
        text: this.newMessage.trim(),
        timestamp: new Date(),
        isCurrentUser: true
      };
      this.messages.push(message);
      this.newMessage = '';
      // TODO: Emit to backend/service for real-time sync
    }
  }

  get filteredMessages(): ChatMessage[] {
      if (!this.searchTerm) return this.messages;
      return this.messages.filter(msg =>
        msg.sender.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  shortenText(text: string, maxLength: number = 100): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
