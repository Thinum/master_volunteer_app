/**
 * Represents an activity or event in the system.
 */
import { Organisation } from './organisation.model';
import { Appointment } from './appointment.model';
import { User } from './user.model';

export interface Activity {
  id: number;
  title: string;
  body: string;

  // optional grouping
  projectId?: number;

  // relations
  organisations: Organisation[];
  appointments: Appointment[];
  participants?: User[];

  // scheduling
  date?: Date;
  startTime?: string;
  endTime?: string;
  duration?: string;
  expiresAt?: Date;

  // location
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // content enrichment
  description?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  isPublic?: boolean;
  status?: 'open' | 'upcoming' | 'finished' | 'canceled';

  // skills & requirements
  skills: string[];
  qualifications: string[];
  prerequisites: string[];

  // logistics
  capacity?: number;
  spotsTaken?: number;
  equipmentProvided?: string[];

  // people & contacts
  createdBy?: User;
  contacts?: {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
  }[];

  orgContacts?: {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
  }[];

  // timestamps
  createdAt: Date;
  updatedAt: Date;
}
