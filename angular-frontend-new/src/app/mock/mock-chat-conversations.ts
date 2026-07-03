import { ChatConversation } from '../models/chat-conversation.model';

export const MOCK_CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 1,
    contact: 'Alice',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg/seed=1',
    lastMessage: 'Hey, have you tried the new Angular signals? They are amazing for reactivity!',
    timestamp: new Date('2025-10-04T14:00:00'),
    unreadCount: 2,
    isActive: true
  },
  {
    id: 2,
    contact: 'Bob',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg/seed=2',
    lastMessage: 'Let us catch up later-free this weekend?',
    timestamp: new Date('2025-10-04T12:30:00'),
    unreadCount: 0,
    isActive: false
  },
  {
    id: 3,
    contact: 'Charlie',
    avatar: 'https://api.dicebear.com/9.x/lorelei/svg/seed=3',
    lastMessage: 'Thanks for the code review tips!',
    timestamp: new Date('2025-10-03T16:45:00'),
    unreadCount: 1,
    isActive: true
  }
];
