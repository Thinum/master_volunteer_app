import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatConversation } from '../../../models/chat-conversation.model';
import { User } from '../../../models/user.model';
import { ChatService } from '../../../services/api/chat.service';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { Router } from '@angular/router';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, MatButtonModule, MatIconModule, AvatarComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  searchTerm: string = '';
  conversations: ChatConversation[] = [];
  currentUser?: User;
  friends: User[] = [];
  showContactPicker = false;

  constructor(
    private chatService: ChatService,
    private volunteerService: VolunteerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.volunteerService.getCurrentUser().subscribe({
      next: user => {
        this.currentUser = user;
        this.loadConversations(user.id);
        this.loadFriends(user.id);
      },
      error: () => {
        this.loadConversations();
        this.loadFallbackContacts();
      }
    });
  }

  get filteredConversations(): ChatConversation[] {
    const visibleConversations = this.conversations.filter(conversation =>
      !this.currentUser || conversation.contactUserId !== this.currentUser.id
    );
    if (!this.searchTerm) return visibleConversations;
    const term = this.searchTerm.toLowerCase();
    return visibleConversations.filter(convo =>
      convo.contact.toLowerCase().includes(term) ||
      convo.lastMessage.toLowerCase().includes(term)
    );
  }

  onNewChat(): void {
    this.showContactPicker = !this.showContactPicker;
  }

  startChat(friend: User): void {
    const existingConversation = this.conversations.find(conversation =>
      conversation.contactUserId === friend.id ||
      conversation.contact.toLowerCase() === (friend.name || friend.username || '').toLowerCase()
    );

    if (existingConversation?.id) {
      this.router.navigate(['/community/chat', existingConversation.id]);
      return;
    }

    const currentUser = this.currentUser;
    if (!currentUser) {
      return;
    }

    this.chatService.createConversationForContact(friend, currentUser).subscribe(conversation => {
      this.conversations = [conversation, ...this.conversations];
      this.showContactPicker = false;
      if (conversation.id) {
        this.router.navigate(['/community/chat', conversation.id]);
      }
    });
  }

  shortenText(text: string, maxLength: number = 60): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private loadConversations(userId?: number): void {
    this.chatService.getConversations(userId).subscribe(conversations => {
      this.conversations = conversations.filter(conversation =>
        !userId || conversation.contactUserId !== userId
      );
    });
  }

  private loadFriends(userId: number): void {
    this.volunteerService.getConnections(userId).subscribe({
      next: friends => this.friends = friends.filter(friend => friend.id !== userId),
      error: () => this.loadFallbackContacts()
    });
  }

  private loadFallbackContacts(): void {
    this.volunteerService.getActiveVolunteers().subscribe({
      next: users => this.friends = users.filter(user => user.id !== this.currentUser?.id),
      error: () => this.friends = []
    });
  }
}
