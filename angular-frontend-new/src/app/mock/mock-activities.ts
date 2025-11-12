import { Activity } from '../models/activity.model';
import { MOCK_ORGANISATIONS } from './mock-organisations';
import { MOCK_APPOINTMENTS } from './mock-appointments';
import { MOCK_USERS } from './mock-users';
import { MOCK_SKILLS } from './mock-skills';

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: 'Community Park Cleanup',
    body: 'Join our team to clean and maintain the park area. Gloves and tools provided.',
    projectId: 101,
    organisations: [MOCK_ORGANISATIONS[0]],
    appointments: [MOCK_APPOINTMENTS[0]],
    friends: [MOCK_USERS[0], MOCK_USERS[1]],
    skills: [MOCK_SKILLS[0].name, MOCK_SKILLS[1].name, MOCK_SKILLS[2].name],
    qualifications: ['None required'],
    prerequisites: ['Basic fitness'],
    createdAt: new Date('2025-10-01T12:00:00Z'),
    updatedAt: new Date('2025-10-15T12:00:00Z'),
  },
  {
    id: 2,
    title: 'Coding Workshop for Kids',
    body: 'Teach kids how to write their first lines of code. A fun and educational event!',
    projectId: 102,
    organisations: [MOCK_ORGANISATIONS[1]],
    appointments: [MOCK_APPOINTMENTS[1]],
    friends: [MOCK_USERS[2]],
    skills: [MOCK_SKILLS[3].name, MOCK_SKILLS[4].name, MOCK_SKILLS[6].name, MOCK_SKILLS[8]?.name],
    qualifications: ['Basic coding experience'],
    prerequisites: ['Patience and enthusiasm'],
    createdAt: new Date('2025-10-20T09:00:00Z'),
    updatedAt: new Date('2025-11-01T12:00:00Z'),
  },
];
