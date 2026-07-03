import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatConversation } from '../../models/chat-conversation.model';
import { ChatMessage } from '../../models/chat-message.model';
import { User } from '../../models/user.model';
import { MOCK_CHAT_CONVERSATIONS } from '../../mock/mock-chat-conversations';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat-conversations`;

  constructor(private http: HttpClient) {}

  getConversations(currentUserId?: number): Observable<ChatConversation[]> {
    if (environment.useMockCommunityData) {
      return of([...MOCK_CHAT_CONVERSATIONS].filter(conversation =>
        !currentUserId || conversation.contactUserId !== currentUserId
      ));
    }

    const url = currentUserId ? `${this.apiUrl}?ownerUserId=${currentUserId}` : this.apiUrl;
    return this.http.get<ChatConversation[]>(url).pipe(
      map(conversations => conversations.map(conversation => this.withDate(conversation)))
    );
  }

  getConversationById(id: number): Observable<ChatConversation | undefined> {
    if (environment.useMockCommunityData) {
      return of(MOCK_CHAT_CONVERSATIONS.find(conversation => conversation.id === id));
    }

    return this.http.get<ChatConversation>(`${this.apiUrl}/${id}`).pipe(
      map(conversation => this.withDate(conversation))
    );
  }

  getMessages(conversationId: number): Observable<ChatMessage[]> {
    if (environment.useMockCommunityData) {
      const conversation = MOCK_CHAT_CONVERSATIONS.find(item => item.id === conversationId);
      if (!conversation) {
        return of([]);
      }
      return of([
        {
          author: 'contact',
          authorUserId: conversation.contactUserId,
          authorName: conversation.contact,
          avatar: conversation.avatar,
          ownMessage: false,
          text: conversation.lastMessage,
          createdAt: conversation.timestamp,
          conversationId
        },
        {
          author: 'me',
          authorUserId: 0,
          authorName: 'You',
          avatar: 'https://api.dicebear.com/9.x/lorelei/svg/seed=current-user',
          ownMessage: true,
          text: 'Thanks for the update. I will check the details and get back to you.',
          createdAt: new Date(conversation.timestamp.getTime() + 1000 * 60 * 12),
          conversationId
        }
      ]);
    }

    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${conversationId}/messages`).pipe(
      map(messages => messages.map(message => this.messageWithDate(message)))
    );
  }

  sendMessage(conversationId: number, text: string, currentUser: User): Observable<ChatMessage> {
    const message: ChatMessage = {
      author: 'me',
      authorUserId: currentUser.id,
      authorName: currentUser.name || currentUser.username || 'You',
      avatar: currentUser.profilePicture || 'https://api.dicebear.com/9.x/lorelei/svg/seed=current-user',
      ownMessage: true,
      text,
      createdAt: new Date(),
      conversationId
    };

    if (environment.useMockCommunityData) {
      const conversation = MOCK_CHAT_CONVERSATIONS.find(item => item.id === conversationId);
      if (conversation) {
        conversation.lastMessage = text;
        conversation.timestamp = message.createdAt;
      }
      return of(message);
    }

    return this.http.post<ChatMessage>(`${this.apiUrl}/${conversationId}/messages`, message).pipe(
      map(createdMessage => this.messageWithDate(createdMessage))
    );
  }

  createConversationForContact(contact: User, currentUser: User): Observable<ChatConversation> {
    return this.createConversation({
      ownerUserId: currentUser.id,
      contactUserId: contact.id,
      contact: contact.name || contact.username || 'New contact',
      avatar: contact.profilePicture,
      lastMessage: 'No messages yet.',
      timestamp: new Date(),
      unreadCount: 0,
      isActive: contact.isActive ?? false
    });
  }

  createConversation(conversation: ChatConversation): Observable<ChatConversation> {
    if (environment.useMockCommunityData) {
      const createdConversation = {
        ...conversation,
        id: Math.max(...MOCK_CHAT_CONVERSATIONS.map(item => item.id ?? 0), 0) + 1,
        timestamp: conversation.timestamp ?? new Date()
      };
      MOCK_CHAT_CONVERSATIONS.unshift(createdConversation);
      return of(createdConversation);
    }

    return this.http.post<ChatConversation>(this.apiUrl, conversation).pipe(
      map(createdConversation => this.withDate(createdConversation))
    );
  }

  private withDate(conversation: ChatConversation): ChatConversation {
    return {
      ...conversation,
      timestamp: new Date(conversation.timestamp)
    };
  }

  private messageWithDate(message: ChatMessage): ChatMessage {
    return {
      ...message,
      createdAt: new Date(message.createdAt)
    };
  }
}
