import {Component, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {MatList, MatListItem} from '@angular/material/list';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgForOf} from '@angular/common';
import {OrganisationService} from '../../../services/api/organisation.service';
import {Organisation} from '../../../models/organisation.model';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {OrganisationListComponent} from './organisation-list/organisation-list.component';
import {
  MOCK_JOINED_ORGANISATIONS,
  MOCK_RECOMMENDED_ORGANISATIONS,
  MOCK_FEATURED_ORGANISATIONS
} from '../../../mock/mock-organisations';

@Component({
  selector: 'app-organisations-overview',
  imports: [
    MatIcon,
    MatLabel,
    MatFormField,
    MatInput,
    MatButton,
    MatMiniFabButton,
    OrganisationListComponent
  ],
  templateUrl: './organisations-overview.component.html',
  styleUrl: './organisations-overview.component.css'
})
export class OrganisationsOverviewComponent implements OnInit{
  organisations: Organisation[] = [];
  organisationsFiltered: Organisation[] = [];

  joinedOrganisations = MOCK_JOINED_ORGANISATIONS;
  recommendedOrganisations = MOCK_RECOMMENDED_ORGANISATIONS;
  featuredOrganisations = MOCK_FEATURED_ORGANISATIONS;

  constructor(private organisationService: OrganisationService){}

  ngOnInit() {
    this.loadOrganisations();
  }

  private loadOrganisations() {
    this.organisationService.getAllOrganisations().subscribe(orgs => {
      this.organisations = orgs;
      this.organisationsFiltered = [...orgs];
    });
  }

  filterBy(searchTerm: string) {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      this.organisationsFiltered = this.organisations.filter(o =>
        o.orgName.toLowerCase().includes(lower)
      );
    } else {
      this.organisationsFiltered = [...this.organisations];
    }
  }
}
