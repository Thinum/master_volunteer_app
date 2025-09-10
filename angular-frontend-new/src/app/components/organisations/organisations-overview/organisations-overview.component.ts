import {Component, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {MatList, MatListItem} from '@angular/material/list';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgForOf} from '@angular/common';
import {OrganisationService} from '../../../services/api/organisation.service';
import {Organisation} from '../../../models/organisations.model';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {OrganisationListComponent} from './organisation-list/organisation-list.component';

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
  public organisations: Organisation[] = [];
  public organisationsFiltered = this.organisations;

  constructor(private organisationService: OrganisationService){

  }

  joinedOrganisations: Organisation[] = [
    {
      id: 3,
      orgName: "Joined Organisation 1",
      location: {
        lat: 0,
        lon: 0
      },
      createdAt: "",
      body: "This is an organisation 1",
      deactivated: false
    },
    {
      id: 4,
      orgName: "Joined Organisation 2",
      location: {
        lat: 0,
        lon: 0
      },
      createdAt: "",
      body: "This is an organisation 2",
      deactivated: false
    }
  ];

  recommendedOrganisations: Organisation[] = [
    {
      id: 5,
      orgName: "Recommended Organisation 1",
      location: {
        lat: 0,
        lon: 0
      },
      createdAt: "",
      body: "This is an organisation 1",
      deactivated: false
    },
    {
      id: 6,
      orgName: "Recommended Organisation 2",
      location: {
        lat: 0,
        lon: 0
      },
      createdAt: "",
      body: "This is an organisation 2",
      deactivated: false
    }
  ];

  ngOnInit() {
    this.getOrganisations()
  }

  getOrganisations() {
    this.organisationService.getAllOrganisations().subscribe(organisations => {
      this.organisations = organisations
      this.organisationsFiltered = this.organisations
    })
  }

  filterBy(searchTerm: string){
    if(searchTerm){
      this.organisationsFiltered = this.organisations.filter(org => org.orgName.includes(searchTerm))
    } else {
      this.organisationsFiltered = this.organisations
    }
  }
}
