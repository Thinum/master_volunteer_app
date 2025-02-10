import { Routes } from '@angular/router';
import {UserProfileComponent} from './components/user/user-profile/user-profile.component';
import {
  OrganisationsOverviewComponent
} from './components/organisations/organisations-overview/organisations-overview.component';
import {
  OrganisationDetailComponent
} from './components/organisations/organisation-detail/organisation-detail.component';

export const routes: Routes = [
  {path: '', component: UserProfileComponent, data: {title: 'Profil'}},
  {path: 'organisations', component: OrganisationsOverviewComponent, data: {title: 'Organisation Overview'}},
  {path: 'organisations/:id', component: OrganisationDetailComponent, data: {title: 'Organisation'}}
  /**TODO change organisations to single organisation just for testing purposes for now */
]
