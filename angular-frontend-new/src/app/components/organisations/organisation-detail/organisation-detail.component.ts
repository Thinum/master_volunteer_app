import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { OrganisationService } from '../../../services/api/organisation.service';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { NgIf } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { User } from '../../../models/user.model'
import { Router } from '@angular/router';
import { CommunityGoalService } from '../../../services/api/community-goal.service';
import { CommunityGoal } from '../../../models/community-goal.model';
import {MatButton, MatIconButton} from '@angular/material/button';
import {Organisation} from '../../../models/organisation.model';
import {Activity} from '../../../models/activity.model';
import {Project} from '../../../models/project.model';
import {ProjectService} from '../../../services/api/project.service';

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
  ],
  templateUrl: './organisation-detail.component.html',
  styleUrl: './organisation-detail.component.css'
})
export class OrganisationDetailComponent implements OnInit {
detailedOrganisation?: Organisation;
id?: number | null;
friends: User[] = [];
goals: CommunityGoal[] = [];
activities: Activity[] = [];
projects: Project[] = [];
visibleActivitiesCount = 2;
hasJoined: boolean = false;

constructor(
    private route: ActivatedRoute,
    private organisationService: OrganisationService,
    private volunteerService: VolunteerService,
    private router: Router,
    private communityGoalService: CommunityGoalService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.id = parseInt(this.route.snapshot.paramMap.get('id') ?? '-1');

    if (this.id) {
      this.organisationService.getOrganisationById(this.id)
        .subscribe(org => {
          this.detailedOrganisation = org;
          this.volunteerService.getCurrentUser().subscribe(user => {
            this.hasJoined = this.detailedOrganisation?.orgMembers?.
              some((orgMember) => orgMember.user.id === user.id) ?? false;
          });
        });

      this.communityGoalService.getGoalsForOrganisation(this.id)
        .subscribe(goals => this.goals = goals);

      this.organisationService.getExampleActivitiesForOrganisation(this.id)
        .subscribe({
          next: activities => this.activities = activities || [],
          error: err => console.error('Could not load organisation activities', err)
        });

      this.projectService.getAllProjects()
        .subscribe(projects => {
          this.projects = this.getMockProjectsForOrganisation(projects || []);
        });

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

  getSpotsTaken(activity: Activity): number {
    return activity.participants?.length ?? activity.spotsTaken ?? 0;
  }

  getProjectStatus(project: Project): string {
    return project.closed ? 'Abgeschlossen' : 'Aktiv';
  }

  get visibleActivities(): Activity[] {
    return this.activities.slice(0, this.visibleActivitiesCount);
  }

  get hasMoreActivities(): boolean {
    return this.activities.length > this.visibleActivitiesCount;
  }

  showMoreActivities(): void {
    this.visibleActivitiesCount += 2;
  }

  private getMockProjectsForOrganisation(projects: Project[]): Project[] {
    if (!projects.length || !this.id) {
      return projects;
    }

    return projects.map((project, index) => ({
      ...project,
      title: this.getProjectTitle(project, index),
      description: this.getProjectDescription(project, index)
    }));
  }

  private getProjectTitle(project: Project, index: number): string {
    const fallbackTitles = [
      'Community Outreach',
      'Volunteer Training',
      'Local Support Hub'
    ];
    return project.title?.startsWith('Example') ? fallbackTitles[index % fallbackTitles.length] : project.title;
  }

  private getProjectDescription(project: Project, index: number): string {
    const fallbackDescriptions = [
      'Koordiniert lokale Einsaetze und verbindet Freiwillige mit konkreten Aufgaben.',
      'Bereitet neue Mitglieder mit Workshops, Materialien und Mentoring auf Einsaetze vor.',
      'Buendelt Ressourcen, Termine und Ansprechpartner fuer laufende Hilfsangebote.'
    ];
    return project.description?.startsWith('Description Project') ? fallbackDescriptions[index % fallbackDescriptions.length] : project.description;
  }

  joinOrganisation(){
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
}
