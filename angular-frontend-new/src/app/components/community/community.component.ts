import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FriendsComponent} from './friends/friends.component';
import {ForumComponent} from './forum/forum.component';
import {ChatComponent} from './chat/chat.component';

@Component({
  selector: 'app-community',
  imports: [
    MatTabGroup,
    MatTab,
    FriendsComponent,
    ForumComponent,
    ChatComponent
  ],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent {

}
