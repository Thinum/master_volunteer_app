import {Component, Input} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbar
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title: string | undefined;
}
