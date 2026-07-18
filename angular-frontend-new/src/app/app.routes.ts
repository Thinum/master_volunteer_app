import { Routes } from '@angular/router';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { OrganisationsOverviewComponent } from './components/organisations/organisations-overview/organisations-overview.component';
import { OrganisationDetailComponent } from './components/organisations/organisation-detail/organisation-detail.component';
import { HomeComponent } from './components/home/home.component';
import { ActivityOverviewComponent } from './components/activities/activity-overview/activity-overview.component';
import { ActivityDetailComponent } from './components/activities/activity-detail/activity-detail.component';
import { CommunityComponent } from './components/community/community.component';
import { ProjectFormComponent } from './components/project/project-form/project-form.component';
import { ProjectDetailComponent } from './components/project/project-detail/project-detail.component';
import { authGuard } from './guard/authGuard';
import { LoginComponent } from './components/login/login.component';
import { CreateActivityComponent } from './components/activities/create-activity/create-activity.component';
import { CreateOrganisationComponent } from './components/organisations/create-organisation/create-organisation.component';
import { EngagementLevelOverviewComponent } from './components/organisations/engagement-level-overview/engagement-level-overview.component';
import {NotificationsListComponent} from './components/notifications/notifications-list/notifications-list.component';
import { RegisterComponent } from './components/register/register.component';
import { CommunityGoalsComponent } from './components/community/community-goals/community-goals.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ForumDetailComponent } from './components/community/forum/forum-detail/forum-detail.component';
import { ChatDetailComponent } from './components/community/chat/chat-detail/chat-detail.component';
import { UserProfileEditComponent } from './components/user/user-profile/user-profile-edit.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { OrganisationAdminAssignmentsComponent } from './components/admin/organisation-admin-assignments/organisation-admin-assignments.component';

export const routes: Routes = [
  {path: '', component: LoginComponent, data: {title: 'Login'}},
  {path: 'home', component: HomeComponent, data: {title: 'Home'}, canActivate: [authGuard]},
  {path: 'organisations', component: OrganisationsOverviewComponent, data: {title: 'Organization Overview'}, canActivate: [authGuard]},
  {path: 'organisations/:id', component: OrganisationDetailComponent, data: {title: 'Organization'}},
  {path: 'organisations/:id/engagement-levels', component: EngagementLevelOverviewComponent, data: {title: 'Engagement Levels'}, canActivate: [authGuard]},
  {path: 'community', component: CommunityComponent, data: {title: 'Community'}, canActivate: [authGuard]},
  {path: 'community/forum/:id', component: ForumDetailComponent, data: {title: 'Forum Topic'}, canActivate: [authGuard]},
  {path: 'community/chat/:id', component: ChatDetailComponent, data: {title: 'Chat'}, canActivate: [authGuard]},
  /**TODO change organisations to single organisation just for testing purposes for now */
  {path: 'profile', component: UserProfileComponent, data: {title: 'Profile'}, canActivate: [authGuard]},
  {path: 'profile/edit', component: UserProfileEditComponent, data: {title: 'Edit Profile'}, canActivate: [authGuard]},
  {path: 'profile/:id', component: UserProfileComponent, data: {title: 'Profile'}, canActivate: [authGuard]},
  {path: 'activities', component: ActivityOverviewComponent, data: {title: 'Activities'}, canActivate: [authGuard]},
  {path: 'activities/:id/edit', component: CreateActivityComponent, data: {title: 'Edit Activity'}, canActivate: [authGuard]},
  {path: 'activities/:id', component: ActivityDetailComponent, data: {title: 'Activities'}, canActivate: [authGuard]},
  {path: 'projects/new', component: ProjectFormComponent, data: {title: 'Create Project'}, canActivate: [authGuard]},
  {path: 'projects/:id/edit', component: ProjectFormComponent, data: {title: 'Edit Project'}, canActivate: [authGuard]},
  {path: 'projects/:id', component: ProjectDetailComponent, data: {title: 'Projects'}, canActivate: [authGuard] },
  {path: 'createActivity', component: CreateActivityComponent, data: {title: 'Create Activity'}, canActivate: [authGuard] },
  {path: 'createOrganisation', component: CreateOrganisationComponent, data: {title: 'Create Organization'}, canActivate: [authGuard] },
  {path: 'notifications', component: NotificationsListComponent, data: {title: 'Notifications List'}, canActivate: [authGuard]},
  {path: 'reports', component: ReportsComponent, data: {title: 'Reports'}, canActivate: [authGuard]},
  {path: 'calendar', component: CalendarComponent, data: {title: 'Calendar'}, canActivate: [authGuard]},
  {path: 'admin/organisation-assignments', component: OrganisationAdminAssignmentsComponent, data: {title: 'Organization Admin Assignments'}, canActivate: [authGuard]},
  {path: 'register', component: RegisterComponent, data: {title: 'Register'}},
  {path: 'community-goals', component: CommunityGoalsComponent}
]
