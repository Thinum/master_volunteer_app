export interface ChatConversation {
  id?: number;
  ownerUserId?: number;
  contactUserId?: number;
  contact: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  isActive?: boolean;
}
