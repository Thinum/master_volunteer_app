import { Component, OnInit } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { User } from '../../../models/user.model';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VolunteerService } from '../../../services/api/volunteer.service';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {CardComponent} from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  imports: [
    MatCard,
    MatCardSubtitle,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    DatePipe,
    MatIcon,
    MatIconButton,
    CardComponent
  ],
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  user?: User;
  id?: number;

  constructor(
    private route: ActivatedRoute,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id'));
      if (!isNaN(this.id) && this.id) {
        this.loadUser(this.id);
      } else {
        // Default to user 1 if no ID or invalid ID
        this.loadUser(1);
      }
    });
  }

  loadUser(id: number): void {
    this.volunteerService.getVolunteerById(id).subscribe(user => {
      this.user = user;
      this.loadFriends(id);
      this.loadOrganisations(id);
      this.loadActivities(id);
    });
  }

  loadFriends(id: number): void {
    this.volunteerService.getFriends(id).subscribe(friends => {
      if (this.user) {
        this.user.friends = friends;
      }
    });
  }

  loadOrganisations(id: number): void {
    this.volunteerService.getOrganisations(id).subscribe(organisations => {
      if (this.user) {
        this.user.organisations = organisations;
      }
    });
  }

  loadActivities(id: number): void {
    this.volunteerService.getActivities(id).subscribe(activities => {
      if (this.user) {
        this.user.activities = activities;
      }
    });
  }
}
