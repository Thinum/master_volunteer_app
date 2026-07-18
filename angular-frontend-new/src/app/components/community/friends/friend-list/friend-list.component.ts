import {Component, Input} from '@angular/core';
import {MatList, MatListItem} from "@angular/material/list";
import {NgForOf} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {User} from '../../../../models/user.model';
import {AvatarComponent} from '../../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-friend-list',
    imports: [
        MatList,
        MatListItem,
        NgForOf,
        RouterLink,
        RouterLinkActive,
        AvatarComponent
    ],
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.css'
})
export class FriendListComponent {
  @Input() friendList?: User[];
  @Input() sectionTitle?: string;
}
