import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatList, MatListItem} from "@angular/material/list";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Organisation} from '../../../../models/organisations.model';

@Component({
  selector: 'app-organisation-list',
  imports: [
    MatIcon,
    MatList,
    MatListItem,
    NgForOf,
    RouterLink,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './organisation-list.component.html',
  styleUrl: './organisation-list.component.css'
})
export class OrganisationListComponent {
    @Input() organisationsList?: Organisation[];
    @Input() sectionTitle?: string;
}
