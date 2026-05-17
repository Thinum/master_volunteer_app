import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-unread-badge',
  imports: [],
  templateUrl: './unread-badge.component.html',
  styleUrl: './unread-badge.component.css'
})
export class UnreadBadgeComponent {
  @Input() count: number = 0;

  constructor() {}
}
