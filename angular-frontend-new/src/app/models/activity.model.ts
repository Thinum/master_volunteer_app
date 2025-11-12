import { Organisation } from './organisation.model';
import { Appointment } from './appointment.model';
import { User } from './user.model';

/**
 * Represents an activity or event in the system.
 */
export interface Activity {
  id: number;
  title: string;
  body: string;
  projectId?: number;

  organisations: Organisation[];
  appointments: Appointment[];
  friends?: User[];

  skills: string[];
  qualifications: string[];
  prerequisites: string[];

  createdAt: Date;
  updatedAt: Date;
}
