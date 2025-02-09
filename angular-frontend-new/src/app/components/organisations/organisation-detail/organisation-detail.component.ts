import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'app-organisation-detail',
  imports: [
    MatIcon,
    MatProgressBar
  ],
  templateUrl: './organisation-detail.component.html',
  styleUrl: './organisation-detail.component.css'
})
export class OrganisationDetailComponent {

}
