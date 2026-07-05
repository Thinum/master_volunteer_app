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
    spotsTaken: 4,
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
    spotsTaken: 3,
    equipmentProvided: ['Computers', 'Learning materials'],

    // meta
    tags: ['education', 'coding', 'kids'],
    difficulty: 'medium',
    isPublic: true,
    status: 'upcoming',

    createdAt: new Date('2025-10-20T09:00:00Z'),
    updatedAt: new Date('2025-11-01T12:00:00Z'),
  },
  {
    id: 3,
    title: 'Food Bank Evening Shift',
    body: 'Sort donations and prepare food packages for local families.',
    description: 'A weekly hands-on shift helping Community Connect move donations into ready-to-deliver care packages.',
    projectId: 103,
    organisations: [MOCK_ORGANISATIONS[2]],
    appointments: [MOCK_APPOINTMENTS[2]],
    date: new Date('2025-09-18T16:00:00Z'),
    startTime: '16:00',
    endTime: '20:00',
    duration: '4 hours',
    expiresAt: new Date('2025-09-20T23:59:59Z'),
    location: 'Community Connect Warehouse',
    coordinates: { lat: 47.0707, lng: 15.4395 },
    participants: [MOCK_USERS[1], MOCK_USERS[3], MOCK_USERS[4], MOCK_USERS[6]],
    contacts: [{ name: 'Diana Reed', role: 'Shift Lead', phone: '333-444-555', email: 'diana@example.com' }],
    orgContacts: [{ name: 'Maya Klein', role: 'Operations', phone: '333-111-222', email: 'ops@example.com' }],
    createdBy: MOCK_USERS[3],
    skills: [MOCK_SKILLS[0].name, MOCK_SKILLS[2].name],
    qualifications: ['None required'],
    prerequisites: ['Able to lift light boxes'],
    capacity: 18,
    spotsTaken: 4,
    equipmentProvided: ['Sorting labels', 'Gloves', 'Refreshments'],
    tags: ['community', 'food', 'families'],
    difficulty: 'easy',
    isPublic: true,
    status: 'finished',
    createdAt: new Date('2025-08-28T10:00:00Z'),
    updatedAt: new Date('2025-09-18T21:00:00Z'),
  },
  {
    id: 4,
    title: 'River Trail Tree Planting',
    body: 'Plant native trees and restore shade along the river trail.',
    description: 'Green Future Org is restoring a public walking route with native trees and small habitat pockets.',
    projectId: 104,
    organisations: [MOCK_ORGANISATIONS[1]],
    appointments: [MOCK_APPOINTMENTS[3]],
    date: new Date('2025-10-04T08:30:00Z'),
    startTime: '08:30',
    endTime: '13:30',
    duration: '5 hours',
    expiresAt: new Date('2025-10-10T23:59:59Z'),
    location: 'Danube River Trail',
    coordinates: { lat: 48.3069, lng: 14.2858 },
    participants: [MOCK_USERS[0], MOCK_USERS[2], MOCK_USERS[4], MOCK_USERS[5], MOCK_USERS[6]],
    contacts: [{ name: 'Leon Weber', role: 'Site Coordinator', phone: '444-555-666', email: 'trees@example.com' }],
    orgContacts: [{ name: 'Anna Schmidt', role: 'Eco Projects', phone: '555-666-777', email: 'green@example.com' }],
    createdBy: MOCK_USERS[2],
    skills: [MOCK_SKILLS[1].name, MOCK_SKILLS[2].name],
    qualifications: ['Outdoor work experience helpful'],
    prerequisites: ['Weather-safe clothing'],
    capacity: 30,
    spotsTaken: 5,
    equipmentProvided: ['Saplings', 'Shovels', 'Water tanks'],
    tags: ['environment', 'trees', 'outdoors'],
    difficulty: 'medium',
    isPublic: true,
    status: 'open',
    createdAt: new Date('2025-09-01T09:00:00Z'),
    updatedAt: new Date('2025-10-02T12:00:00Z'),
  },
  {
    id: 5,
    title: 'Senior Digital Help Desk',
    body: 'Help seniors use phones, email, video calls, and public service apps.',
    description: 'A calm drop-in help desk where volunteers answer everyday technology questions for older adults.',
    projectId: 105,
    organisations: [MOCK_ORGANISATIONS[3], MOCK_ORGANISATIONS[0]],
    appointments: [MOCK_APPOINTMENTS[4]],
    date: new Date('2025-11-08T10:00:00Z'),
    startTime: '10:00',
    endTime: '13:00',
    duration: '3 hours',
    expiresAt: new Date('2025-11-12T23:59:59Z'),
    location: 'Education for All Center',
    coordinates: { lat: 47.8095, lng: 13.055 },
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[5]],
    contacts: [{ name: 'Ethan Brooks', role: 'Volunteer Trainer', phone: '777-888-999', email: 'digital@example.com' }],
    orgContacts: [{ name: 'Sofia Lang', role: 'Learning Coordinator', phone: '222-444-666', email: 'learning@example.com' }],
    createdBy: MOCK_USERS[4],
    skills: [MOCK_SKILLS[3].name, MOCK_SKILLS[4].name],
    qualifications: ['Patient communication'],
    prerequisites: ['Basic smartphone and email knowledge'],
    capacity: 12,
    spotsTaken: 3,
    equipmentProvided: ['Tablets', 'Printed guides'],
    tags: ['education', 'technology', 'seniors'],
    difficulty: 'medium',
    isPublic: true,
    status: 'upcoming',
    createdAt: new Date('2025-10-03T09:00:00Z'),
    updatedAt: new Date('2025-10-22T14:00:00Z'),
  },
  {
    id: 6,
    title: 'Community Health Day',
    body: 'Support a wellness day with check-in, guidance, and booth logistics.',
    description: 'HealthFirst Initiative needs volunteers to welcome guests, guide visitors, and keep stations moving.',
    projectId: 106,
    organisations: [MOCK_ORGANISATIONS[4]],
    appointments: [MOCK_APPOINTMENTS[5]],
    date: new Date('2025-12-12T09:00:00Z'),
    startTime: '09:00',
    endTime: '15:00',
    duration: '6 hours',
    expiresAt: new Date('2025-12-15T23:59:59Z'),
    location: 'HealthFirst Initiative Hall',
    coordinates: { lat: 48.1486, lng: 17.1077 },
    participants: [MOCK_USERS[2], MOCK_USERS[3], MOCK_USERS[4], MOCK_USERS[6]],
    contacts: [{ name: 'Fiona Mayer', role: 'Program Manager', phone: '888-999-000', email: 'health@example.com' }],
    orgContacts: [{ name: 'Nora Weiss', role: 'Community Health Lead', phone: '123-987-456', email: 'wellness@example.com' }],
    createdBy: MOCK_USERS[5],
    skills: [MOCK_SKILLS[0].name, MOCK_SKILLS[5]?.name].filter(Boolean),
    qualifications: ['Friendly guest support'],
    prerequisites: ['Comfortable standing for longer periods'],
    capacity: 20,
    spotsTaken: 4,
    equipmentProvided: ['Name tags', 'Information sheets', 'Water'],
    tags: ['health', 'wellness', 'community'],
    difficulty: 'easy',
    isPublic: true,
    status: 'open',
    createdAt: new Date('2025-11-01T08:00:00Z'),
    updatedAt: new Date('2025-11-20T16:00:00Z'),
  },
];
