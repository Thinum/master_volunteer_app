import {Component, Input} from '@angular/core';
import {Activity} from '../../../models/activity.model';
import {User} from '../../../models/user.model';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-activities-small-card',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './activities-small-card.component.html',
  styleUrl: './activities-small-card.component.css'
})
export class ActivitiesSmallCardComponent {
  @Input() activity?: Activity;
  @Input() friends?: User[];
}
