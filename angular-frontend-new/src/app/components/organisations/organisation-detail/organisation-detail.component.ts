import {Component, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {ActivatedRoute} from '@angular/router';
import {OrganisationService} from '../../../services/api/organisation.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-organisation-detail',
  imports: [
    MatIcon,
    MatProgressBar,
    NgIf
  ],
  templateUrl: './organisation-detail.component.html',
  styleUrl: './organisation-detail.component.css'
})
export class OrganisationDetailComponent implements OnInit{
  detailedOrganisation: any;
  private id?: number | null;
  constructor(private route: ActivatedRoute, private organisationService: OrganisationService) {

  }

  ngOnInit(){
    this.id = parseInt(this.route.snapshot.paramMap.get('id') ?? '-1');
    if(this.id) {
      this.organisationService.getOrganisationById(this.id).subscribe(org => this.detailedOrganisation=org)
    }
  }
}
