import { ForumEntry } from '../models/forum-entry.model';

export const MOCK_FORUM_ENTRIES: ForumEntry[] = [
  {
    id: 1,
    title: 'Community Garden Project',
    lastMessage: 'Looking for volunteers to help plant native flowers this weekend!',
    lastEdited: new Date('2025-10-01'),
    icon: 'https://api.dicebear.com/9.x/lorelei/svg/seed=4',
    newPosts: 5
  },
  {
    id: 2,
    title: 'Local Library Reading Program',
    lastMessage: 'Does anyone have experience organizing story time for kids aged 6-10?',
    lastEdited: new Date('2025-09-28'),
    icon: 'https://api.dicebear.com/9.x/lorelei/svg/seed=5'
  },
  {
    id: 3,
    title: 'Beach Cleanup Initiative',
    lastMessage: 'We collected 200kg of waste last month! Next meetup: Saturday at 9 AM.',
    lastEdited: new Date('2025-10-03'),
    icon: 'https://api.dicebear.com/9.x/lorelei/svg/seed=6',
    newPosts: 2
  }
];
