import { Routes } from '@angular/router';
import {UserProfileComponent} from './components/user/user-profile/user-profile.component';
import {
  OrganisationsOverviewComponent
} from './components/organisations/organisations-overview/organisations-overview.component';
import {
  OrganisationDetailComponent
} from './components/organisations/organisation-detail/organisation-detail.component';
import {HomeComponent} from './components/home/home.component';
import {
  ActivityOverviewComponent
} from './components/activities/activity-overview/activity-overview.component';
import {
  ActivityDetailComponent
} from './components/activities/activity-detail/activity-detail.component';
import {CommunityComponent} from './components/community/community.component';
import {ProjectDetailComponent} from './components/project/project-detail/project-detail.component';


export const routes: Routes = [
  {path: '', component: HomeComponent, data: {title: 'Home'}},
  {path: 'organisations', component: OrganisationsOverviewComponent, data: {title: 'Organisation Overview'}},
  {path: 'organisations/:id', component: OrganisationDetailComponent, data: {title: 'Organisation'}},
  {path: 'community', component: CommunityComponent, data: {title: 'Community'}},
  /**TODO change organisations to single organisation just for testing purposes for now */
  {path: 'profile', component: UserProfileComponent, data: {title: 'Profil'}},
  {path: 'profile/:id', component: UserProfileComponent, data: {title: 'Profil'}},
  {path: 'activities', component: ActivityOverviewComponent, data: {title: 'Activities'}},
  { path: 'activities/:id', component: ActivityDetailComponent, data: {title: 'Activities'}},
  { path: 'projects/:id', component: ProjectDetailComponent, data: {title: 'Projects'} }
]
