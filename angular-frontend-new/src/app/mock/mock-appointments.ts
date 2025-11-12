import { Appointment } from '../models/appointment.model';

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    title: 'Park Cleanup',
    description: 'Help clean up Pasching Park and recycle waste.',
    location: 'Pasching Park',
    startDateTime: new Date('2025-11-20T09:00:00Z'),
    endDateTime: new Date('2025-11-20T12:00:00Z'),
    createdBy: 1,
    activityId: 1,
  },
  {
    id: 2,
    title: 'Coding Workshop',
    description: 'Teach basic programming concepts to children aged 10–14.',
    location: 'Linz Tech Center',
    startDateTime: new Date('2025-12-05T14:00:00Z'),
    endDateTime: new Date('2025-12-05T18:00:00Z'),
    createdBy: 2,
    activityId: 2,
  },
];
