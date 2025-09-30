import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatList, MatListItem} from "@angular/material/list";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {User} from '../../../../models/user.model';

@Component({
  selector: 'app-friend-list',
    imports: [
        MatIcon,
        MatList,
        MatListItem,
        NgForOf,
        NgIf,
        RouterLink,
        RouterLinkActive
    ],
  templateUrl: './friend-list.component.html',
  styleUrl: './friend-list.component.css'
})
export class FriendListComponent {
  @Input() friendList?: User[];
  @Input() sectionTitle?: string;
}
