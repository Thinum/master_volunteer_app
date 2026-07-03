export interface ChatMessage {
  id?: number;
  author: string;
  authorUserId?: number;
  authorName?: string;
  avatar?: string;
  ownMessage?: boolean;
  text: string;
  createdAt: Date;
  conversationId?: number;
}
