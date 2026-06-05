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
    description: 'A community-driven initiative to clean up the local park, remove litter, and improve green spaces.',

    projectId: 101,
    organisations: [MOCK_ORGANISATIONS[0]],
    appointments: [MOCK_APPOINTMENTS[0]],

    // scheduling
    date: new Date('2025-10-12T09:00:00Z'),
    startTime: '09:00',
    endTime: '14:00',
    duration: '5 hours',
    expiresAt: new Date('2025-12-31T23:59:59Z'),

    // location
    location: 'Blue Mountain Park',
    coordinates: {
      lat: 48.3069,
      lng: 14.2858,
    },

    // people
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2], MOCK_USERS[3]],
    contacts: [
      {
        name: 'Emily Carter',
        role: 'Event Coordinator',
        phone: '123-456-789',
        email: 'emily@example.com',
      },
    ],
    orgContacts: [
      {
        name: 'John Doe',
        role: 'Club President',
        phone: '987-654-321',
        email: 'org@example.com',
      },
    ],
    createdBy: MOCK_USERS[0],

    // skills & requirements
    skills: [
      MOCK_SKILLS[0].name,
      MOCK_SKILLS[1].name,
      MOCK_SKILLS[2].name,
    ],
    qualifications: ['None required'],
    prerequisites: ['Basic fitness', 'Comfortable working outdoors'],

    // logistics
    capacity: 25,
    spotsTaken: 8,
    equipmentProvided: ['Gloves', 'Trash bags', 'Grabbers'],

    // meta
    tags: ['environment', 'community', 'volunteering'],
    difficulty: 'easy',
    isPublic: true,
    status: 'open',

    createdAt: new Date('2025-10-01T12:00:00Z'),
    updatedAt: new Date('2025-10-15T12:00:00Z'),
  },

  {
    id: 2,
    title: 'Coding Workshop for Kids',
    body: 'Teach kids how to write their first lines of code. A fun and educational event!',
    description: 'Interactive workshop introducing children to programming basics using visual and simple coding tools.',

    projectId: 102,
    organisations: [MOCK_ORGANISATIONS[1]],
    appointments: [MOCK_APPOINTMENTS[1]],

    // scheduling
    date: new Date('2025-10-20T09:00:00Z'),
    startTime: '09:00',
    endTime: '12:00',
    duration: '3 hours',
    expiresAt: new Date('2025-11-01T23:59:59Z'),

    // location
    location: 'Tech Learning Center',
    coordinates: {
      lat: 48.3060,
      lng: 14.2865,
    },

    // people
    participants: [MOCK_USERS[2], MOCK_USERS[0], MOCK_USERS[6]],
    contacts: [
      {
        name: 'Sarah Müller',
        role: 'Workshop Lead',
        phone: '222-333-444',
        email: 'sarah@example.com',
      },
    ],
    orgContacts: [
      {
        name: 'Anna Schmidt',
        role: 'Education Manager',
        phone: '555-666-777',
        email: 'edu@example.com',
      },
    ],
    createdBy: MOCK_USERS[2],

    // skills & requirements
    skills: [
      MOCK_SKILLS[3].name,
      MOCK_SKILLS[4].name,
      MOCK_SKILLS[6].name,
      MOCK_SKILLS[8]?.name,
    ].filter(Boolean),

    qualifications: ['Basic coding experience', 'Experience with children preferred'],
    prerequisites: ['Patience', 'Laptop required'],

    // logistics
    capacity: 15,
    spotsTaken: 5,
    equipmentProvided: ['Computers', 'Learning materials'],

    // meta
    tags: ['education', 'coding', 'kids'],
    difficulty: 'medium',
    isPublic: true,
    status: 'upcoming',

    createdAt: new Date('2025-10-20T09:00:00Z'),
    updatedAt: new Date('2025-11-01T12:00:00Z'),
  },
];
