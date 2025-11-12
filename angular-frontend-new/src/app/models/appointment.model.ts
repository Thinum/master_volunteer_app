/**
 * Represents a scheduled appointment, either personal or related to an activity.
 */
export interface Appointment {
  id: number;
  title: string;
  description?: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  createdBy?: number;   // userId or organizationId for backend reference
  activityId?: number;  // linked activity
}
