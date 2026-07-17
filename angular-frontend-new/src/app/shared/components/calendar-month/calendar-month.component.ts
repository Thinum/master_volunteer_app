import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChild, ViewChildren, inject } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CalendarDay, CalendarEvent, CalendarEventType } from '../../../models/calendar-event.model';

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, GoogleMapsModule],
  templateUrl: './calendar-month.component.html',
  styleUrl: './calendar-month.component.css'
})
export class CalendarMonthComponent implements OnChanges {
  @Input() events: CalendarEvent[] = [];
  @Input() compact = false;
  @Input() allowNavigation = true;
  @Output() daySelected = new EventEmitter<Date>();

  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly eventTypes: { type: CalendarEventType; label: string }[] = [
    { type: 'activity', label: 'Activity' },
    { type: 'personal', label: 'My appointment' },
    { type: 'goal', label: 'Community goal deadline' },
    { type: 'organisation', label: 'Organisation joined' },
    { type: 'reactivation', label: 'Reactivation' }
  ];

  viewDate = this.startOfMonth(new Date());
  viewMode: 'calendar' | 'map' = 'calendar';
  days: CalendarDay[] = [];
  selectedMapEvent?: CalendarEvent;

  @ViewChild(MapInfoWindow) private infoWindow?: MapInfoWindow;
  @ViewChildren(MapMarker) private mapMarkers?: QueryList<MapMarker>;

  private readonly router = inject(Router);
  private activeMap?: google.maps.Map;

  constructor() {
    this.rebuildDays();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) this.rebuildDays();
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(this.viewDate);
  }

  get mappedEvents(): CalendarEvent[] {
    return this.events.filter(event =>
      (event.type === 'activity' || event.type === 'organisation')
      && Number.isFinite(event.coordinates?.lat)
      && Number.isFinite(event.coordinates?.lng)
    );
  }

  get activityMapEvents(): CalendarEvent[] {
    return this.mappedEvents
      .filter(event => event.type === 'activity')
      .sort((left, right) => left.start.getTime() - right.start.getTime());
  }

  get nextUpcomingActivity(): CalendarEvent | undefined {
    const now = Date.now();
    return this.activityMapEvents.find(event => (event.end ?? event.start).getTime() >= now);
  }

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.rebuildDays();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.rebuildDays();
  }

  goToToday(): void {
    this.viewDate = this.startOfMonth(new Date());
    this.rebuildDays();
  }

  setViewMode(mode: 'calendar' | 'map'): void {
    this.viewMode = mode;
    this.selectedMapEvent = undefined;
    this.infoWindow?.close();
  }

  onMapReady(map: google.maps.Map): void {
    this.activeMap = map;
    const nextActivity = this.nextUpcomingActivity;
    if (nextActivity) {
      this.focusMapEvent(nextActivity, undefined, map);
      return;
    }
    this.showAllMapEvents(map);
  }

  showAllMapEvents(map = this.activeMap): void {
    this.selectedMapEvent = undefined;
    this.infoWindow?.close();
    if (!map || !this.mappedEvents.length) return;
    const bounds = new google.maps.LatLngBounds();
    this.mappedEvents.forEach(event => bounds.extend(event.coordinates!));
    map.fitBounds(bounds, 48);

    if (this.mappedEvents.length === 1) {
      google.maps.event.addListenerOnce(map, 'idle', () => map.setZoom(13));
    }
  }

  mapPosition(event: CalendarEvent): google.maps.LatLngLiteral {
    return event.coordinates!;
  }

  markerIcon(event: CalendarEvent): string | google.maps.Icon {
    if (event.type === 'organisation' && event.markerImageUrl) {
      return {
        url: event.markerImageUrl,
        scaledSize: new google.maps.Size(44, 44),
        anchor: new google.maps.Point(22, 22)
      };
    }

    const isActivity = event.type === 'activity';
    const color = isActivity ? '#46608a' : '#438963';
    const symbol = isActivity
      ? '<text x="19" y="23" fill="#fff" font-family="Arial,sans-serif" font-size="13" font-weight="700" text-anchor="middle">A</text>'
      : '<path fill="#fff" d="M13 28V12h12v16h-4v-4h-4v4h-4Zm3-12h2v-2h-2v2Zm4 0h2v-2h-2v2Zm-4 4h2v-2h-2v2Zm4 0h2v-2h-2v2Z"/>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46"><path fill="${color}" stroke="#fff" stroke-width="2" d="M19 1C9.1 1 1 9.1 1 19c0 13.5 18 26 18 26s18-12.5 18-26C37 9.1 28.9 1 19 1Z"/><circle cx="19" cy="19" r="10" fill="#fff" fill-opacity=".16"/>${symbol}</svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  openMapEvent(marker: MapMarker, event: CalendarEvent): void {
    this.focusMapEvent(event, marker);
  }

  selectActivity(eventId: string): void {
    if (!eventId) {
      this.showAllMapEvents();
      return;
    }
    const event = this.activityMapEvents.find(item => item.id === eventId);
    if (event) this.focusMapEvent(event);
  }

  focusNextActivity(): void {
    const activities = this.activityMapEvents;
    if (!activities.length) return;
    const selectedIndex = this.selectedMapEvent?.type === 'activity'
      ? activities.findIndex(event => event.id === this.selectedMapEvent?.id)
      : -1;
    const next = selectedIndex >= 0
      ? activities[(selectedIndex + 1) % activities.length]
      : this.nextUpcomingActivity ?? activities[0];
    this.focusMapEvent(next);
  }

  mapEventTypeLabel(event: CalendarEvent): string {
    return event.type === 'activity' ? 'Activity' : 'Organisation joined';
  }

  mapEventDate(event: CalendarEvent): string {
    const options: Intl.DateTimeFormatOptions = event.allDay
      ? { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
      : { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('en', options).format(event.start);
  }

  selectDay(day: CalendarDay): void {
    this.daySelected.emit(new Date(day.date));
  }

  openEvent(event: CalendarEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    if (event.route) {
      domEvent.preventDefault();
      void this.router.navigateByUrl(event.route);
    }
  }

  openSelectedMapEvent(): void {
    if (this.selectedMapEvent?.route) void this.router.navigateByUrl(this.selectedMapEvent.route);
  }

  visibleEvents(day: CalendarDay): CalendarEvent[] {
    return this.compact ? day.events.slice(0, 2) : day.events.slice(0, 3);
  }

  formatTime(event: CalendarEvent): string {
    if (event.allDay) return '';
    return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(event.start);
  }

  dayAriaLabel(day: CalendarDay): string {
    const date = new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(day.date);
    const eventCount = day.events.length;
    return `${date}. ${eventCount ? `${eventCount} ${eventCount === 1 ? 'event' : 'events'}.` : 'No events.'} Select to add an appointment.`;
  }

  isPastEvent(event: CalendarEvent): boolean {
    return (event.end ?? event.start).getTime() < Date.now();
  }

  private rebuildDays(): void {
    const first = this.startOfMonth(this.viewDate);
    const mondayOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - mondayOffset);

    this.days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return {
        date,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === this.viewDate.getMonth(),
        isToday: this.isSameDay(date, new Date()),
        events: this.eventsForDay(date)
      };
    });
  }

  private focusMapEvent(event: CalendarEvent, marker?: MapMarker, map = this.activeMap): void {
    this.selectedMapEvent = event;
    map?.panTo(event.coordinates!);
    map?.setZoom(14);

    const resolvedMarker = marker ?? this.mapMarkers?.get(this.mappedEvents.findIndex(item => item.id === event.id));
    if (resolvedMarker) this.infoWindow?.open(resolvedMarker, false);
  }

  private eventsForDay(date: Date): CalendarEvent[] {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.events
      .filter(event => event.start <= end && (event.end ?? event.start) >= start)
      .sort((left, right) => left.start.getTime() - right.start.getTime());
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private isSameDay(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear()
      && left.getMonth() === right.getMonth()
      && left.getDate() === right.getDate();
  }
}
