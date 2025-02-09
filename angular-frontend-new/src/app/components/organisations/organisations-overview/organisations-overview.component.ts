import { Component } from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatList, MatListItem} from '@angular/material/list';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgForOf} from '@angular/common';

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
    NgForOf
  ],
  templateUrl: './organisations-overview.component.html',
  styleUrl: './organisations-overview.component.css'
})
export class OrganisationsOverviewComponent {
  joinedOrganisations = [
    { name: 'Org 1', joined: true },
    { name: 'Org 2', joined: true }
  ];

  recommendedOrganisations = [
    { name: 'Org A', joined: false },
    { name: 'Org B', joined: false }
  ];
}
