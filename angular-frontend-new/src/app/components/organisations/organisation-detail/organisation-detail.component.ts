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
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { User } from '../../../models/user.model'
import { Router } from '@angular/router';
import { CommunityGoalService } from '../../../services/api/community-goal.service';
import { CommunityGoal } from '../../../models/community-goal.model';
import {MatButton, MatIconButton} from '@angular/material/button';
import {Organisation} from '../../../models/organisation.model';
import { GoogleMapsModule } from '@angular/google-maps';
import { Project } from '../../../models/project.model';
import { ProjectService } from '../../../services/api/project.service';
import { Activity } from '../../../models/activity.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EngagementLevelOverview } from '../../../models/engagement-level.model';
import { AuthService } from '../../../services/authservice/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

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
    MatExpansionModule,
    DatePipe,
    CommonModule,
    NgIf,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatButton,
    GoogleMapsModule,
    MatTooltipModule,
    AvatarComponent,
  ],
  templateUrl: './organisation-detail.component.html',
  styleUrl: './organisation-detail.component.css'
})
export class OrganisationDetailComponent implements OnInit {
  detailedOrganisation?: Organisation;
  id?: number | null;
  private friendIds = new Set<number>();
  goals: CommunityGoal[] = [];
  projects: Project[] = [];
  canManage = false;
  canManageContent = false;
  engagementOverview?: EngagementLevelOverview;
  activities: Activity[] = [];
  visibleActivities: Activity[] = [];
  hasJoined = false;
  isAuthenticated = false;
  locationLabel = FALLBACK_LOCATION_LABEL;
  mapCenter: google.maps.LatLngLiteral = { lat: 48.3069, lng: 14.2858 };
  mapMarker?: google.maps.LatLngLiteral;

  private readonly activitiesPageSize = 3;
  private visibleActivityCount = this.activitiesPageSize;

  get allMembers(): User[] {
    return this.detailedOrganisation?.orgMembers?.map(member => member.user) ?? [];
  }

  get friendMembers(): User[] {
    return this.allMembers.filter(member => this.friendIds.has(member.id));
  }

constructor(
    private route: ActivatedRoute,
    private organisationService: OrganisationService,
    private volunteerService: VolunteerService,
    private router: Router,
    private communityGoalService: CommunityGoalService,
    private projectService: ProjectService,
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.id = parseInt(this.route.snapshot.paramMap.get('id') ?? '-1');
    this.isAuthenticated = this.authService.isAuthenticated();

    if (this.id) {
      if (this.isAuthenticated) {
        this.loadEngagementOverview();
      }
      this.organisationService.getOrganisationById(this.id)
        .subscribe(org => {
          this.detailedOrganisation = org;
          this.updateMapLocation(org);
          this.updateLocationLabel(org);
          if (this.isAuthenticated) {
            this.volunteerService.getCurrentUser().subscribe(user => {
              this.hasJoined = this.detailedOrganisation?.orgMembers?.
                some((orgMember) => orgMember.user.id === user.id) ?? false;
              this.volunteerService.getFriends(user.id).subscribe({
                next: friends => this.friendIds = new Set((friends ?? []).map(friend => friend.id)),
                error: err => console.error('Could not load friends', err)
              });
            });
          }
        });

      this.communityGoalService.getGoalsForOrganisation(this.id)
        .subscribe(goals => this.goals = goals);

      this.organisationService.getExampleActivitiesForOrganisation(this.id)
        .subscribe(activities => {
          this.activities = activities ?? [];
          this.visibleActivityCount = this.activitiesPageSize;
          this.updateVisibleActivities();
        });

   }

    this.projectService.getAllProjects(this.id ?? undefined)
      .subscribe(projects => this.projects = projects ?? []);

    if (this.isAuthenticated) {
      this.organisationService.getAdministeredOrganisations().subscribe({
        next: organisations => this.canManage = organisations.some(org => org.id === this.id),
        error: () => this.canManage = false
      });
    }

  }

  get engagementLimitation(): string {
    return this.engagementOverview?.managementLimitation
      || 'Reach Level 3 to create, update or delete activities and manage organization goals.';
  }

  inviteOthers(): void {
    if (!this.engagementOverview?.canInvite || !this.detailedOrganisation) {
      return;
    }
    const inviteUrl = `${window.location.origin}/organisations/${this.id}`;
    if (navigator.share) {
      void navigator.share({
        title: `Join ${this.detailedOrganisation.orgName}`,
        text: `Join me at ${this.detailedOrganisation.orgName} on iVolunteer.`,
        url: inviteUrl
      });
      return;
    }
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(inviteUrl);
    } else {
      window.prompt('Copy this organization invitation link:', inviteUrl);
    }
  }

  private loadEngagementOverview(): void {
    if (!this.id) {
      return;
    }
    this.organisationService.getEngagementLevels(this.id).subscribe({
      next: overview => {
        this.engagementOverview = overview;
        this.canManageContent = overview.canManageActivitiesAndGoals;
      },
      error: () => {
        this.engagementOverview = undefined;
        this.canManageContent = false;
      }
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


  createProject(): void {
    if (this.id) {
      this.router.navigate(['/projects/new'], { queryParams: { organisationId: this.id } });
    }
  }

  createActivity(): void {
    if (this.id && this.canManageContent) {
      this.router.navigate(['/createActivity'], { queryParams: { organisationId: this.id } });
    }
  }

  goToCreateGoal(): void {
    if (!this.id || !this.canManageContent) {
      return;
    }

    this.router.navigate(['/community-goals'], {
      queryParams: { organisationId: this.id, mode: 'create' }
    });
  }

  goToEditGoal(goal: CommunityGoal): void {
    if (!this.id || !goal.id || !this.canManageContent) {
      return;
    }

    this.router.navigate(['/community-goals'], {
      queryParams: { organisationId: this.id, mode: 'edit', goalId: goal.id }
    });
  }

  goToUserProfile(event: Event, userId: number): void {
    event.preventDefault();
    event.stopPropagation();

    if (!userId) {
      return;
    }

    this.router.navigate(['/profile', userId]);
  }

  getGoalProgress(goal: CommunityGoal): number {
    const current = goal.currentValue ?? 0;
    const target = goal.targetValue ?? 0;
    if (!target || target <= 0) {
      return 0;
    }
    return (current / target) * 100;
  }

  getActivityContributionGroups(goal: CommunityGoal): {
    title: string;
    date?: Date;
    members: { id: number; name: string; profilePicture?: string }[];
  }[] {
    const activitiesById = new Map<
      number,
      { title: string; date?: Date; members: { id: number; name: string; profilePicture?: string }[] }
    >();

    (goal.contributions ?? []).forEach(contribution => {
      const memberName =
        contribution.member.name || contribution.member.username || contribution.member.email || 'Unknown member';
      const member = {
        id: contribution.member.id,
        name: memberName,
        profilePicture: contribution.member.profilePicture
      };

      contribution.activities.forEach(activity => {
        const existing = activitiesById.get(activity.id) ?? {
          title: activity.title,
          date: activity.date,
          members: []
        };

        if (!existing.members.some(existingMember => existingMember.id === member.id)) {
          existing.members.push(member);
        }

        activitiesById.set(activity.id, existing);
      });
    });

    return Array.from(activitiesById.values());
  }

  get hasMoreActivities(): boolean {
    return this.visibleActivities.length < this.activities.length;
  }

  getProjectStatus(project: Project): string {
    return project.closed ? 'Closed' : 'Open';
  }

  getSpotsTaken(activity: Activity): number {
    return activity.spotsTaken ?? activity.participants?.length ?? 0;
  }

  showMoreActivities(): void {
    this.visibleActivityCount += this.activitiesPageSize;
    this.updateVisibleActivities();
  }


  joinOrganisation(){
    if (!this.isAuthenticated) {
      this.snackBar.open('Log in to join this organization.', 'Close', { duration: 4000 });
      void this.router.navigate(['/']);
      return;
    }
    if (this.id === null || this.id === undefined) return;
    this.organisationService.joinOrganisation(this.id).subscribe({
        next: result => {
          if (result) {
            this.hasJoined = true;
            this.loadEngagementOverview();
          } else {
            this.snackBar.open('You are already a member of this organization.', 'Close', { duration: 4000 });
          }
        },
        error: err => {
          const message = err?.status === 401 || err?.status === 403
            ? 'Your session is no longer valid. Please log in again.'
            : err?.error?.message || 'Could not join this organization.';
          this.snackBar.open(message, 'Close', { duration: 5000 });
        }
      },
    );
  }

  private updateVisibleActivities(): void {
    this.visibleActivities = this.activities.slice(0, this.visibleActivityCount);
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
