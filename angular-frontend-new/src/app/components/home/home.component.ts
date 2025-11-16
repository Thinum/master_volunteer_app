import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from '../../shared/components/card/card.component';
import { MOCK_USERS } from '../../mock/mock-users';
import { MOCK_ORGANISATIONS } from '../../mock/mock-organisations';
import { MOCK_ACTIVITIES } from '../../mock/mock-activities';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
  CommonModule,
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  CardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  user = {
    name: 'Herbert Mayer',
    role: 'Administrator',
    badges: 221,
    functions: 6,
    activities: 21
  };

  requests = MOCK_USERS.slice(0, 3).map((user: User) => ({
    organisation: MOCK_ORGANISATIONS[Math.floor(Math.random() * MOCK_ORGANISATIONS.length)].orgName,
        title: MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)].title,
        hours: Math.floor(Math.random() * 400) + 100,
        user: {
          name: user.name,
          avatar: user.profilePicture
        }
    }));
}
