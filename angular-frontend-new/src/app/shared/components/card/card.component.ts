import { Component, Input  } from '@angular/core';
import { RouterLink} from '@angular/router';
import { NgClass} from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [RouterLink, NgClass],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() link: RouterLink['routerLink'] = null;
  @Input() size: 'default' | 'compact' = 'default';
}
