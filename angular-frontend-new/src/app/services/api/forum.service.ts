import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_FORUM_ENTRIES } from '../../mock/mock-forum-entries';
import { ForumEntry } from '../../models/forum-entry.model';
import { ForumReply } from '../../models/forum-reply.model';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = `${environment.apiUrl}/forum-entries`;

  constructor(private http: HttpClient) {}

  getForumEntries(): Observable<ForumEntry[]> {
    if (environment.useMockCommunityData) {
      return of([...MOCK_FORUM_ENTRIES]);
    }

    return this.http.get<ForumEntry[]>(this.apiUrl).pipe(
      map(entries => entries.map(entry => this.withDate(entry)))
    );
  }

  getForumEntryById(id: number): Observable<ForumEntry | undefined> {
    if (environment.useMockCommunityData) {
      return of(MOCK_FORUM_ENTRIES.find(entry => entry.id === id));
    }

    return this.http.get<ForumEntry>(`${this.apiUrl}/${id}`).pipe(
      map(entry => this.withDate(entry))
    );
  }

  getReplies(forumEntryId: number): Observable<ForumReply[]> {
    if (environment.useMockCommunityData) {
      const forum = MOCK_FORUM_ENTRIES.find(entry => entry.id === forumEntryId);
      if (!forum) {
        return of([]);
      }
      return of([
        {
          author: 'Community Team',
          avatar: forum.icon,
          message: forum.lastMessage,
          createdAt: forum.lastEdited,
          forumEntryId
        }
      ]);
    }

    return this.http.get<ForumReply[]>(`${this.apiUrl}/${forumEntryId}/replies`).pipe(
      map(replies => replies.map(reply => this.replyWithDate(reply)))
    );
  }

  createReply(forumEntryId: number, message: string, author: string, avatar: string): Observable<ForumReply> {
    const reply: ForumReply = {
      author,
      avatar,
      message,
      createdAt: new Date(),
      forumEntryId
    };

    if (environment.useMockCommunityData) {
      return of(reply);
    }

    return this.http.post<ForumReply>(`${this.apiUrl}/${forumEntryId}/replies`, reply).pipe(
      map(createdReply => this.replyWithDate(createdReply))
    );
  }

  createForumEntry(entry: ForumEntry): Observable<ForumEntry> {
    if (environment.useMockCommunityData) {
      const createdEntry = {
        ...entry,
        id: Math.max(...MOCK_FORUM_ENTRIES.map(item => item.id ?? 0), 0) + 1,
        lastEdited: entry.lastEdited ?? new Date()
      };
      MOCK_FORUM_ENTRIES.unshift(createdEntry);
      return of(createdEntry);
    }

    return this.http.post<ForumEntry>(this.apiUrl, entry).pipe(
      map(createdEntry => this.withDate(createdEntry))
    );
  }

  private withDate(entry: ForumEntry): ForumEntry {
    return {
      ...entry,
      lastEdited: new Date(entry.lastEdited)
    };
  }

  private replyWithDate(reply: ForumReply): ForumReply {
    return {
      ...reply,
      createdAt: new Date(reply.createdAt)
    };
  }
}
