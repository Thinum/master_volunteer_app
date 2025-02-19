import {Component, OnInit} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatFabAnchor, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatList, MatListItem} from '@angular/material/list';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgForOf} from '@angular/common';
import {OrganisationService} from '../../../services/api/organisation.service';
import {Organisation} from '../../../models/organisations.model';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-organisations-overview',
  imports: [
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatListItem,
    MatList,
    MatLabel,
    MatFormField,
    MatInput,
    MatButton,
    MatMiniFabButton,
    NgForOf,
    MatFabAnchor,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './organisations-overview.component.html',
  styleUrl: './organisations-overview.component.css'
})
export class OrganisationsOverviewComponent implements OnInit{
  public organisations: Organisation[] = [];
  public organisationsFiltered = this.organisations;

  constructor(private organisationService: OrganisationService){

  }

  joinedOrganisations = [
    { name: 'Org 1', joined: true },
    { name: 'Org 2', joined: true }
  ];

  recommendedOrganisations = [
    { name: 'Org A', joined: false },
    { name: 'Org B', joined: false }
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
