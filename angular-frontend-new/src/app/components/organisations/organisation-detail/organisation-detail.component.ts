import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrganisationService } from '../../../services/api/organisation.service';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { User } from '../../../models/user.model'
import { Router } from '@angular/router';
import { CommunityGoalService } from '../../../services/api/community-goal.service';
import { CommunityGoal } from '../../../models/community-goal.model';
import { MatButton, MatIconButton } from '@angular/material/button';
import { Organisation } from '../../../models/organisation.model';
import { GoogleMapsModule } from '@angular/google-maps';

const FALLBACK_LOCATION_LABEL = 'Location unavailable';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  county?: string;
  state?: string;
}

interface NominatimReverseResponse {
  display_name?: string;
  address?: NominatimAddress;
}

@Component({
  selector: 'app-organisation-detail',
  imports: [
    MatIcon,
    MatProgressBar,
    MatListModule,
    MatCardModule,
    DatePipe,
    CommonModule,
    NgIf,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatButton,
    GoogleMapsModule,
  ],
  templateUrl: './organisation-detail.component.html',
  styleUrl: './organisation-detail.component.css'
})
export class OrganisationDetailComponent implements OnInit {
  detailedOrganisation?: Organisation;
  id?: number | null;
  friends: User[] = [];
  goals: CommunityGoal[] = [];
  hasJoined = false;
  locationLabel = FALLBACK_LOCATION_LABEL;
  mapCenter: google.maps.LatLngLiteral = { lat: 48.3069, lng: 14.2858 };
  mapMarker?: google.maps.LatLngLiteral;

  constructor(
    private route: ActivatedRoute,
    private organisationService: OrganisationService,
    private volunteerService: VolunteerService,
    private router: Router,
    private communityGoalService: CommunityGoalService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.id = parseInt(this.route.snapshot.paramMap.get('id') ?? '-1');

    if (this.id) {
      this.organisationService.getOrganisationById(this.id)
        .subscribe(org => {
          this.detailedOrganisation = org;
          this.updateMapLocation(org);
          this.updateLocationLabel(org);
          this.volunteerService.getCurrentUser().subscribe(user => {
            this.hasJoined = this.detailedOrganisation?.orgMembers?.
              some((orgMember) => orgMember.user.id === user.id) ?? false;
          });
        });

      this.communityGoalService.getGoalsForOrganisation(this.id)
        .subscribe(goals => this.goals = goals);

    }

    this.volunteerService.getAllVolunteers()
      .subscribe(users => {
        this.friends = users;
      });
  }

  goToCommunityGoals(): void {
    if (!this.id) {
      return;
    }

    this.router.navigate(['/community-goals'], {
      queryParams: { organisationId: this.id }
    });
  }

  getGoalProgress(goal: CommunityGoal): number {
    const current = goal.currentValue ?? 0;
    const target = goal.targetValue ?? 0;
    if (!target || target <= 0) {
      return 0;
    }
    return (current / target) * 100;
  }

  joinOrganisation() {
    if (this.id === null || this.id === undefined) return;
    this.organisationService.joinOrganisation(this.id).subscribe({
        next: result => {
          if (result) {
            console.log('Joined activity:', result);
            this.hasJoined = true;
          } else {
            console.error('Could not join activity')
          }
        },
        error: err =>
          // TODO: Maybe move to message bar
          console.error('Could not join activity', err)
      },
    );
  }

  private updateLocationLabel(org: Organisation): void {
    this.locationLabel = FALLBACK_LOCATION_LABEL;

    const params = new HttpParams()
      .set('format', 'jsonv2')
      .set('addressdetails', '1')
      .set('zoom', '18')
      .set('layer', 'address')
      .set('lat', org.location.lat)
      .set('lon', org.location.lon);

    this.http.get<NominatimReverseResponse>(NOMINATIM_REVERSE_URL, { params })
      .subscribe({
        next: result => {
          this.locationLabel = this.formatNominatimAddress(result);
        },
        error: () => {
          this.locationLabel = FALLBACK_LOCATION_LABEL;
        },
      });
  }

  private updateMapLocation(org: Organisation): void {
    this.mapCenter = {
      lat: org.location.lat,
      lng: org.location.lon,
    };
    this.mapMarker = this.mapCenter;
  }

  private formatNominatimAddress(result: NominatimReverseResponse): string {
    const address = result.address;
    if (!address) {
      return result.display_name || FALLBACK_LOCATION_LABEL;
    }

    const streetName = address.road || address.pedestrian || address.footway;
    const street = [streetName, address.house_number].filter(Boolean).join(' ');
    const city = address.city
      || address.town
      || address.village
      || address.municipality
      || address.suburb
      || address.county
      || address.state;

    return [street, city].filter(Boolean).join(', ') || result.display_name || FALLBACK_LOCATION_LABEL;
  }
}
