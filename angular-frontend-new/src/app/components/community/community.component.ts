import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FriendsComponent} from './friends-chat/friends.component';
import {ForumComponent} from './forum/forum.component';

@Component({
  selector: 'app-community',
  imports: [
    MatTabGroup,
    MatTab,
    FriendsComponent,
    ForumComponent
  ],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent {

}
