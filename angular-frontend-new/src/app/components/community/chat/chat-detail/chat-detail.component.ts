import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatConversation } from '../../../../models/chat-conversation.model';
import { ChatMessage } from '../../../../models/chat-message.model';
import { User } from '../../../../models/user.model';
import { ChatService } from '../../../../services/api/chat.service';
import { VolunteerService } from '../../../../services/api/volunteer.service';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.css'
})
export class ChatDetailComponent implements OnInit {
  conversation?: ChatConversation;
  isLoading = true;
  newMessage = '';
  messages: ChatMessage[] = [];
  currentUser?: User;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    const conversationId = Number(this.route.snapshot.paramMap.get('id'));

    this.volunteerService.getCurrentUser().subscribe({
      next: user => {
        this.currentUser = user;
        this.applyMessageOwnership();
      },
      error: () => this.currentUser = undefined
    });

    this.chatService.getConversationById(conversationId).subscribe(conversation => {
      this.conversation = conversation;
      this.isLoading = false;
      if (conversation?.id) {
        this.loadMessages(conversation.id);
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text) {
      return;
    }

    const conversationId = this.conversation?.id;
    if (!conversationId) {
      return;
    }

    const currentUser = this.currentUser ?? {
      id: 0,
      name: 'Volunteer',
      email: '',
      joinedAt: new Date(),
      profilePicture: 'https://api.dicebear.com/9.x/lorelei/svg/seed=current-user'
    };

    this.chatService.sendMessage(conversationId, text, currentUser).subscribe(message => {
      this.messages = [...this.messages, message];
      this.newMessage = '';
      if (this.conversation) {
        this.conversation = {
          ...this.conversation,
          lastMessage: text,
          timestamp: message.createdAt
        };
      }
    });
  }

  private loadMessages(conversationId: number): void {
    this.chatService.getMessages(conversationId).subscribe(messages => {
      this.messages = messages.map(message => this.withOwnership(message));
    });
  }

  private applyMessageOwnership(): void {
    this.messages = this.messages.map(message => this.withOwnership(message));
  }

  private withOwnership(message: ChatMessage): ChatMessage {
    const currentUserId = this.currentUser?.id;
    return {
      ...message,
      ownMessage: currentUserId != null
        ? message.authorUserId === currentUserId
        : message.ownMessage === true
    };
  }
}
