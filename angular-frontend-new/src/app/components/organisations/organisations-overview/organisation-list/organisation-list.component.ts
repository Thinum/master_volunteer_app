import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {NgForOf, NgIf, SlicePipe} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Organisation} from '../../../../models/organisation.model';

@Component({
  selector: 'app-organisation-list',
  imports: [
    MatIcon,
    NgForOf,
    RouterLink,
    RouterLinkActive,
    NgIf,
    SlicePipe
  ],
  templateUrl: './organisation-list.component.html',
  styleUrl: './organisation-list.component.css'
})
export class OrganisationListComponent {
    @Input() organisationsList?: Organisation[];
    @Input() sectionTitle?: string;

    getMemberCount(org: Organisation): number {
      return org.orgMembers?.length ?? 0;
    }
}
