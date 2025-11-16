import { User } from '../models/user.model';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Alice',
    profilePicture: 'https://i.pravatar.cc/40?img=1',
    email: 'alice@mail.com',
    joinedAt: new Date(2024, 2, 10, 2, 30),
    isActive: true,
  },
  {
    id: 2,
    name: 'Bob',
    profilePicture: 'https://i.pravatar.cc/40?img=2',
    email: 'bob@mail.com',
    joinedAt: new Date(2024, 2, 10, 2, 30),
    isActive: true,
  },
  {
    id: 3,
    name: 'Charlie',
    profilePicture: 'https://i.pravatar.cc/40?img=3',
    email: 'charlie@mail.com',
    joinedAt: new Date(2024, 2, 10, 2, 30),
    isActive: true,
  },
  {
    id: 4,
    name: 'Diana',
    profilePicture: 'https://i.pravatar.cc/40?img=4',
    email: 'diana@mail.com',
    phone: '+43 660 111 2222',
    joinedAt: new Date(2024, 2, 10, 2, 30),
    isActive: true,
  },
  {
    id: 5,
    name: 'Ethan',
    profilePicture: 'https://i.pravatar.cc/40?img=5',
    email: 'ethan@mail.com',
    phone: '+43 660 222 3333',
    joinedAt: new Date(2024, 2, 10, 2, 30),
    isActive: true,
  },
  {
    id: 6,
    name: 'Fiona',
    profilePicture: 'https://i.pravatar.cc/40?img=6',
    email: 'fiona@mail.com',
    joinedAt: new Date(2024, 2, 10, 2, 30),
    isActive: false,
  },
  {
    id: 7,
    name: 'George',
    profilePicture: 'https://i.pravatar.cc/40?img=7',
    email: 'george@mail.com',
    joinedAt: new Date(2024, 2, 10, 2, 30),
    isActive: true,
  },
];

export interface UserRelationship {
  userId: number;
  friends: {
    friendId: number;
    likeScore: number; // 0 = hate, 100 = best friends
  }[];
}

export const MOCK_USER_RELATIONSHIPS: UserRelationship[] = [
  {
    userId: 1, // Alice
    friends: [
      { friendId: 2, likeScore: 85 }, // Bob
      { friendId: 3, likeScore: 60 }, // Charlie
      { friendId: 4, likeScore: 92 }, // Diana
    ],
  },
  {
    userId: 2, // Bob
    friends: [
      { friendId: 1, likeScore: 80 },
      { friendId: 3, likeScore: 70 },
      { friendId: 5, likeScore: 55 },
    ],
  },
  {
    userId: 3, // Charlie
    friends: [
      { friendId: 1, likeScore: 65 },
      { friendId: 2, likeScore: 75 },
      { friendId: 6, likeScore: 40 }, // Fiona (inactive)
    ],
  },
  {
    userId: 4, // Diana
    friends: [
      { friendId: 1, likeScore: 95 },
      { friendId: 7, likeScore: 50 },
    ],
  },
  {
    userId: 5, // Ethan
    friends: [
      { friendId: 2, likeScore: 60 },
      { friendId: 7, likeScore: 78 },
    ],
  },
  {
    userId: 6, // Fiona
    friends: [
      { friendId: 3, likeScore: 35 },
    ],
  },
  {
    userId: 7, // George
    friends: [
      { friendId: 4, likeScore: 25 },
      { friendId: 5, likeScore: 82 },
    ],
  },
];

