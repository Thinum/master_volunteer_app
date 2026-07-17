export type CalendarEventType = 'activity' | 'personal' | 'goal' | 'organisation' | 'reactivation';

export interface CalendarEventCoordinates {
  lat: number;
  lng: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  start: Date;
  end?: Date;
  allDay: boolean;
  location?: string;
  coordinates?: CalendarEventCoordinates;
  markerImageUrl?: string;
  description?: string;
  route?: string;
  personalAppointmentId?: number;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
