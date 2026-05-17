import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { OrganisationService } from '../../../services/api/organisation.service';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { NgIf } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { User } from '../../../models/user.model'

@Component({
  selector: 'app-organisation-detail',
  imports: [
    MatIcon,
    MatProgressBar,
    MatListModule,
    MatCardModule,
    DatePipe,
    CommonModule,
    NgIf,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './organisation-detail.component.html',
  styleUrl: './organisation-detail.component.css'
})
export class OrganisationDetailComponent implements OnInit{
  detailedOrganisation: any;
  private id?: number | null;
  friends: User[] = [];
  constructor(private route: ActivatedRoute, private organisationService: OrganisationService,  private volunteerService: VolunteerService) {}

  ngOnInit(){
    this.id = parseInt(this.route.snapshot.paramMap.get('id') ?? '-1');
    if(this.id) {
      this.organisationService.getOrganisationById(this.id).subscribe(org => this.detailedOrganisation=org)
    }

    this.volunteerService.getAllVolunteers().subscribe(users => {
      this.friends = users;
    });

  }
}
