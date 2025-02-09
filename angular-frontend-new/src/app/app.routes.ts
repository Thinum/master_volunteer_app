import { Routes } from '@angular/router';
import {
  OrganisationDetailComponent
} from './components/organisations/organisation-detail/organisation-detail.component';
import {UserProfileComponent} from './components/user/user-profile/user-profile.component';

export const routes: Routes = [
  {path: '', component: UserProfileComponent},
  {path: 'organisations', component: OrganisationDetailComponent}
]
